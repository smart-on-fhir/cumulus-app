import React                  from "react"
import { request }            from "./backend"
import { humanizeColumnName } from "./utils"
import { app }                from "./types"


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
    s3_path                   ?: string
}

export interface Site {
    id: string
    name: string
    studies: Record<string, Record<string, StudyPeriod>>
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

/**
 * Used to check if a local subscription can be upgraded to newer data package.
 * Compares the local package with a remote one and returns true if they are
 * compatible. The be considered compatible:
 * - Both packages should have the same `column_types_format_version`
 * - All local columns should exist in the remote package
 * - All local columns should have the same data type as in the remote package
 */
function packageColumnsChanged(local: DataPackage, remote: DataPackage): boolean {
    if (local.column_types_format_version !== remote.column_types_format_version) return true

    for (const name in local.columns) {
        const remoteColumn = remote.columns[name]
        
        // Remote columns does not exist
        if (!remoteColumn) {
            return true
        }
        
        const localColumn = local.columns[name]
        
        // Remote columns has different data type
        if (localColumn !== remoteColumn) {
            return true
        }
    }

    return false
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

    public async getSites(): Promise<Site[]> {
        const data = await this.fetch("/api/aggregator/study-periods")
        return Object.keys(data).map(k => {
            const studies = data[k]
            return {
                id: k,
                name: humanizeColumnName(k),
                studies
            }
        })
    }

    public async getStudyPeriods(studyId: string): Promise<StudyPeriod[]> {
        const all = await this.getAllStudyPeriods()
        return all.filter(p => p.study === studyId)
    }

    public async getStudies(): Promise<Study[]> {
        const data = await this.getPackages()
        return data.reduce((prev, cur) => {
            if (!prev.find(s => s.id === cur.study)) {
                prev.push({
                    id   : cur.study,
                    label: humanizeColumnName(cur.study)
                })
            }
            return prev;
        }, [] as Study[])
    }

    public async getStudyVersions(studyId: string): Promise<string[]> {
        const data = await this.filterPackages({ study: studyId })
        return data.reduce((prev, cur) => {
            if (!prev.find(s => s === cur.version)) {
                prev.push(cur.version)
            }
            return prev;
        }, [] as string[]).sort()
    }

    public async getPackages(): Promise<DataPackage[]> {
        const result: DataPackage[] = await this.fetch("/api/aggregator/data-packages")
        if (!Array.isArray(result)) {
            throw new AggregatorError(`Expected array of data packages but got ${typeof result}`)
        }
        return result
    }

    public async getPackage(id: string): Promise<DataPackage|undefined> {
        const all = await this.getPackages();
        return all.find(p => p.id === id)
    }

    public async filterPackages(props: Partial<DataPackage>): Promise<DataPackage[]> {
        let out = await this.getPackages()
        return filter(out, props)
    }

    public async getLatestPackageId(pkgId: string) {
        const pkg = await this.getPackage(pkgId)

        // PACKAGE NOT FOUND
        if (!pkg) {
            return "" 
        }

        const allPackages = await this.getPackages()
        const allVersions = filter(allPackages, { study: pkg.study, name: pkg.name })

        // PACKAGE VERSION NOT FOUND
        if (!allVersions.some(x => x.version === pkg.version)) {
            return ""
        }

        allVersions.sort((a, b) => b.version.localeCompare(a.version))
        
        for (let i = 0; i < allVersions.length; i++) {
            let current = allVersions[i];
            if (current.version <= pkg.version) {
                return pkg.id; // PACKAGE UP TO DATE
            }

            // if we are here, we have a newer version. Check the structure now
            if (!packageColumnsChanged(current, pkg)) {
                return current.id // UPDATE POSSIBLE
            }
        }

        // PACKAGE UP TO DATE
        return pkg.id;
    }

    public async getPackageJson(s3path: string): Promise<{ schema: any, data: any[] }> {
        return await this.fetch("/api/aggregator/from-parquet/?s3_path=" + encodeURIComponent(s3path));
    }

    public getPackageMetadata(pkg: DataPackage) {
        return {
            total: +pkg.total,
            type : pkg.type || "cube",
            cols : Object.keys(pkg.columns).map(name => {
                let type = String(pkg.columns[name])
                    .replace("year" , "date:YYYY")
                    .replace("month", "date:YYYY-MM")
                    .replace("week" , "date:YYYY-MM-DD")
                    .replace("day"  , "date:YYYY-MM-DD") as app.supportedDataType;

                return {
                    name,
                    label      : humanizeColumnName(name),
                    description: humanizeColumnName(name),
                    dataType   : type
                }
            })
        }
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