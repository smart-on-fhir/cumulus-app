import React                  from "react"
import { request }            from "./backend"
import { humanizeColumnName } from "./utils"


interface Metadata {
    [site: string]: {
        [study: string]: {
            [pkg: string]: {
                [version: string]: {
                    last_upload     : string // date
                    last_data_update: string | null
                    last_aggregation: string | null
                    last_error      : string | null
                    deleted         : string | null
                    transaction_format_version: number
                }
            }
        }
    }
}

export interface Study {
    id: string
    label: string
    // periods: Record<string, StudyPeriod>
}

export interface StudyPeriod {
    earliest_date: string
    latest_date: string
    last_data_update: string
    study_period_format_version: number
    
    version: string
    site: string
    study: string
}

export interface DataPackage {
    column_types_format_version: string // example: "1"
    columns                    : Record<string, DataPackageColumnDataType>
    id                         : string // example: "core__count_condition_icd10_month"
    last_data_update           : string // example: "2024-09-30T18:13:49.211590+00:00"
    name                       : string // example: "count_condition_icd10_month"
    study                      : string // example: "core"
    total                      : number // example: 1359
    version                    : string // example: "000"
    type                      ?: "cube" | "flat"
}

export type DataPackageColumnDataType = "string" | "integer" | "float" | "boolean" | "year" | "month" | "week" | "day"

export class AggregatorError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AggregatorError"
        this.message = message
        Error.captureStackTrace(this, this.constructor)
    }
}

function filter<T>(data: T[], props: Partial<T>): T[] {
    return data.filter(x => {
        for (const propName in props) {
            if (props[propName] !== x[propName]) return false
        }
        return true
    })
}

function packageColumnsChanged(pkg1: DataPackage, pkg2: DataPackage) {
    if (pkg1.column_types_format_version !== pkg2.column_types_format_version) return true
    if (Object.keys(pkg1.columns).length !== Object.keys(pkg2.columns).length) return true
    const a = Object.keys(pkg1.columns).map(x => `${x}:${pkg1.columns[x]}`).sort()
    const b = Object.keys(pkg2.columns).map(x => `${x}:${pkg1.columns[x]}`).sort()
    return JSON.stringify(a) !== JSON.stringify(b)
}

export function humanizePackageId(id: string) {
    const [study, name, version] = id.trim().split("__")
    return `${humanizeColumnName(study)}/${humanizeColumnName(name)}/${version}`
}

class Aggregator
{
    private cache: Record<string, any> = {}

    public baseUrl = ""

    private _packages: DataPackage[] | undefined

    public async initialize() {
        if (!this._packages) {
            const result: DataPackage[] = await this.fetch("/api/aggregator/data-packages")
            
            if (!Array.isArray(result)) {
                throw new AggregatorError(`Expected array of data packages but got ${typeof result}`)
            }
            // assert(Array.isArray(result), `Expected array of data packages but got ${typeof result}`, AggregatorError)

            this._packages = result
        }

        return this
    }

    get packages() {
        if (!this._packages) {
            throw new AggregatorError("Aggregator not initialized")
        }
        return this._packages
    }

    private async fetch(uri: string) {
        try {
            if (!this.cache[uri]) {
                this.cache[uri] = request(uri, { includeResponse: true })
                    .then(({ response, body }) => {
                        this.baseUrl = String(response.headers.get("X-Upstream-Host") || "")
                        if (!response.ok) {
                            throw new AggregatorError(body.message || body)
                        }
                        return body
                    })
            }
            return await this.cache[uri]
        } catch (ex) {
            throw new AggregatorError((ex as Error).message)
        }
    }

    public async getMetadata(): Promise<Metadata> {
        return this.fetch("/api/aggregator/metadata")
    }

    public async getAllStudyPeriods(): Promise<StudyPeriod[]> {
        const out: StudyPeriod[] = []
        const data = await this.fetch("/api/aggregator/study-periods")
        
        for (const siteId in data) {
            const site = data[siteId]
            for (const studyId in site) {
                const study = site[studyId]
                for (const version in study) {
                    out.push({
                        ...study[version],
                        version,
                        site: siteId,
                        study: studyId
                    })
                }
            }
        }
        // console.log("getStudyPeriods:", out)
        return out
    }

    public async getStudyPeriods(studyId: string): Promise<StudyPeriod[]> {
        const all = await this.getAllStudyPeriods()
        return all.filter(p => p.study === studyId)
    }

    public async getStudies(): Promise<Study[]> {
        const data = await this.getPackages()
        // console.log("packages ===> ", typeof data, data)
        return data.reduce((prev, cur) => {
            if (!prev.find(s => s.id === cur.study)) {
                prev.push({
                    id: cur.study,
                    label: humanizeColumnName(cur.study)
                })
            }
            return prev;
        }, [] as Study[])
    }

    public async getPackages(): Promise<DataPackage[]> {
        const result: DataPackage[] = await this.fetch("/api/aggregator/data-packages")
        
        // if (typeof result === "string") {
        //     throw new Error("Not connected")
        // }
        if (!Array.isArray(result)) {
            throw new AggregatorError(`Expected array of data packages but got ${typeof result}`)
        }
        // assert(Array.isArray(result), `Expected array of data packages but got ${typeof result}`, AggregatorError)
        return result
    }

    public async getPackage(id: string): Promise<DataPackage|undefined> {
        const all = await this.getPackages();
        return all.find(p => p.id === id)
        // return this.fetch(`/api/aggregator/data_packages/${id}`)
    }

    public async filterPackages(props: Partial<DataPackage>): Promise<DataPackage[]> {
        let out = await this.getPackages()
        return filter(out, props)
    }

    public async getLatestPackageId(pkgId: string) {
        const pkg = await this.getPackage(pkgId)

        if (!pkg) {
            return "" // PACKAGE_NO_LONGER_AVAILABLE
        }

        const allPackages = await this.getPackages()
        const allVersions = filter(allPackages, { study: pkg.study, name: pkg.name })

        if (!allVersions.some(x => x.version === pkg.version)) {
            return "" // PACKAGE_NO_LONGER_AVAILABLE
        }

        allVersions.sort((a, b) => b.version.localeCompare(a.version))
        
        for (let i = 0; i < allVersions.length; i++) {
            let current = allVersions[i];
            if (current.version <= pkg.version) {
                return pkg.id; // "PACKAGE_UP_TO_DATE"
            }

            // if we are here, we have a newer version. Check the structure now
            if (!packageColumnsChanged(current, pkg)) {
                return current.id // UPDATE POSSIBLE
            }
        }

        return pkg.id; // "PACKAGE_UP_TO_DATE"
    }
}

const aggregator = new Aggregator()

export default aggregator

interface AggregatorContextType {
    aggregator: Aggregator
    status    : "connected" | "failed" | "offline" | "loading"
    error     : string | null
}

const AggregatorContext = React.createContext<AggregatorContextType>(null!);

export function AggregatorProvider({ children }: { children: React.ReactNode }) {
    const [status , setStatus ] = React.useState<AggregatorContextType["status"]>("loading");
    const [error  , setError  ] = React.useState<string | null>(null);
    
    React.useEffect(() => {
        aggregator.initialize().then(
            () => {
                setStatus("connected")
            },
            e => {
                setStatus(e.message === "The aggregator API is not enabled" ? "offline" : "failed")
                setError(String(e))
            }
        );
    }, []);

    return (
        <AggregatorContext.Provider value={{ aggregator, status, error }}>
            {children}
        </AggregatorContext.Provider>
    );
}

export function useAggregator() {
    return React.useContext(AggregatorContext);
}