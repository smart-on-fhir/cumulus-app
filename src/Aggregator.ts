import { request } from "./backend"
import { assert, humanizeColumnName } from "./utils"


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
        Error.captureStackTrace(this, this.constructor)
    }
}

class Aggregator
{
    private cache: Record<string, any> = {}

    private async fetch(uri: string) {
        try {
            if (!this.cache[uri]) {
                this.cache[uri] = request(uri)
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
        const result: DataPackage[] = await this.fetch("/api/aggregator/data_packages")
        assert(Array.isArray(result), `Expected array of data packages but got ${typeof result}`, AggregatorError)
        return result
    }

    public async getPackage(id: string): Promise<DataPackage|undefined> {
        const all = await this.getPackages();
        return all.find(p => p.id === id)
        // return this.fetch(`/api/aggregator/data_packages/${id}`)
    }

    public synchronize() {
        // 1. Know when we updated last
    }
}

export default new Aggregator()
