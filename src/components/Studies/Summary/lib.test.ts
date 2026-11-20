import { DataPackage, Metadata }                                            from "../../../Aggregator"
import { getCoverage, getDimension, getDimensionMatrix, getResourceLabel, getTimeStrip, getUploads, NO_DATE, ResourceSummary } from "./lib"


function entry(last_upload: string | null, last_error: string | null = null, props: Record<string, string> = {}) {
    return { last_upload, last_data_update: null, last_aggregation: null, last_error, deleted: null, transaction_format_version: 2, ...props } as any
}

function pkg(name: string, props: Partial<DataPackage> = {}) {
    return { id: `core__${name}__003`, name, study: "core", version: "003", total: 1, columns: {}, ...props } as DataPackage
}

describe("getResourceLabel", () => {
    it ("uses the first resource the name mentions", () => {
        expect(getResourceLabel("count_condition_month")).toBe("Conditions")
        expect(getResourceLabel("count_c_attachment_count_diagnosticreport")).toBe("Diagnostic Reports")
        expect(getResourceLabel("cube_patient_llm_dx")).toBe("Patients")
    })

    it ("groups the rest as Metadata or Other", () => {
        expect(getResourceLabel("meta_date")).toBe("Metadata")
        expect(getResourceLabel("ibd")).toBe("Other")
    })
})

describe("getUploads", () => {
    it ("reads the versions from all the key formats", () => {
        const metadata = {
            bch: {
                core: {
                    count_condition_month      : { "003": entry("2024-01-01"), "count_condition_month__005": entry("2025-01-01") },
                    core__count_patient        : { "003": entry("2024-02-01") },
                    core__core__count_procedure: { "core__core__count_procedure__004": entry("2024-03-01") },
                }
            }
        } as unknown as Metadata
        expect(getUploads(metadata, "core").map(u => [u.table, u.version, u.lastUpdate])).toEqual([
            ["count_condition_month", "003", "2024-01-01"],
            ["count_condition_month", "005", "2025-01-01"],
            ["count_patient"        , "003", "2024-02-01"],
            ["count_procedure"      , "004", "2024-03-01"],
        ])
    })

    it ("keeps the latest of duplicate entries, and strips the site of flat packages", () => {
        const metadata = {
            bch: {
                data_metrics: {
                    summary__bch               : { "003": entry("2024-01-01") },
                    data_metrics__summary__bch : { "003": entry("2024-06-01", "2024-06-02") },
                }
            }
        } as unknown as Metadata
        expect(getUploads(metadata, "data_metrics")).toEqual([
            { site: "bch", table: "summary", version: "003", lastUpdate: "2024-06-01", lastError: "2024-06-02", earlierError: null }
        ])
    })

    it ("uses the latest of the upload, data update and aggregation times", () => {
        const metadata = { bch: { core: {
            count_patient  : { "003": entry(null, null, { last_data_update: "2024-03-01T10:00:00.123456+00:00", last_aggregation: "2024-03-01T10:00:00.234567+00:00" }) },
            count_procedure: { "003": entry("2024-05-01T00:00:00+00:00", null, { last_aggregation: "2024-04-01T00:00:00+00:00" }) },
        } } } as unknown as Metadata
        expect(getUploads(metadata, "core").map(u => u.lastUpdate)).toEqual(["2024-03-01T10:00:00.234567+00:00", "2024-05-01T00:00:00+00:00"])
    })

    it ("only reports an error as current if nothing happened after it", () => {
        const metadata = { bch: { core: {
            count_patient  : { "003": entry("2024-01-01T00:00:00+00:00", "2024-01-01T00:01:00+00:00") },
            count_procedure: { "003": entry("2024-01-01T00:00:00+00:00", "2024-01-01T00:01:00+00:00", { last_aggregation: "2024-01-01T00:02:00+00:00" }) },
            count_condition: { "003": entry(null, "2024-01-01T00:01:00+00:00") },
        } } } as unknown as Metadata
        expect(getUploads(metadata, "core").map(u => [u.table, u.lastError, u.earlierError])).toEqual([
            ["count_patient"  , "2024-01-01T00:01:00+00:00", null],
            ["count_procedure", null, "2024-01-01T00:01:00+00:00"],
            ["count_condition", "2024-01-01T00:01:00+00:00", null],
        ])
    })

    it ("skips deleted entries", () => {
        const metadata = { bch: { core: { count_patient: { "003": { ...entry("2024-01-01"), deleted: "2024-02-01" } } } } } as unknown as Metadata
        expect(getUploads(metadata, "core")).toEqual([])
    })
})

describe("getCoverage", () => {
    it ("counts the uploaded, failed and undated packages per site and kind of data", () => {
        const packages = [pkg("count_condition_month"), pkg("count_condition_icd10_month"), pkg("count_patient"), pkg("count_procedure")]
        const coverage = getCoverage(packages, [
            { site: "a", table: "count_condition_month", version: "003", lastUpdate: "2024-01-01", lastError: null, earlierError: null },
            { site: "a", table: "count_condition_icd10_month", version: "003", lastUpdate: "2024-05-01", lastError: "x", earlierError: null },
            { site: "a", table: "count_procedure", version: "003", lastUpdate: null, lastError: "x", earlierError: null },
            { site: "b", table: "count_patient", version: "003", lastUpdate: null, lastError: null, earlierError: null },
            { site: "c", table: "count_patient", version: "002", lastUpdate: "2024-02-01", lastError: null, earlierError: null },
        ], "003")
        expect(coverage.sites).toEqual(["a", "b"])
        expect(coverage.groups.map(g => g.label)).toEqual(["Conditions", "Patients", "Procedures"])
        expect(coverage.cells.a.Conditions).toMatchObject({ expected: 2, uploaded: 2, failed: 1, undated: 0, lastUpdate: "2024-05-01" })
        expect(coverage.cells.a.Conditions.uploads.map(u => u.table)).toEqual(["count_condition_month", "count_condition_icd10_month"])
        expect(coverage.cells.a.Patients).toEqual({ expected: 1, uploaded: 0, failed: 0, undated: 0, lastUpdate: undefined, uploads: [] })
        expect(coverage.cells.b.Patients).toMatchObject({ uploaded: 1, undated: 1, lastUpdate: undefined })
        // Failed uploads count as failed, whether they have a date or not
        expect(coverage.cells.a.Procedures).toMatchObject({ uploaded: 1, failed: 1, undated: 0 })
    })
})

describe("getTimeStrip", () => {
    const data = {
        column: "month", stratifier: "site", filters: [], totalCount: 0, rowCount: 0, counts: {},
        data: [
            // 1900 holds more than 1% of the records, but is far from the rest
            { stratifier: "a", rows: [["1900-01-01", 50], ["2019-01-01", 10], ["2020-01-01", 1000], ["2021-06-01", 2000], ["2022-01-01", 1000], [NO_DATE, 7]] },
            { stratifier: "b", rows: [["2021-01-01", 500], ["2090-01-01", 1]] },
        ]
    } as any

    const options = { now: new Date("2026-06-01"), yearCount: 16 }

    it ("shows the last years up to the current one, and counts older and future records apart", () => {
        const strip = getTimeStrip(data, options)
        expect(strip.years).toEqual([2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026])
        expect(strip.span).toEqual(["1900-01-01", "2090-01-01"])
        expect(strip.total).toBe(4568)
        expect(strip.rows[0]).toEqual({ site: "a", total: 4067, earlier: 50, later: 0, noDate: 7, years: { 2019: 10, 2020: 1000, 2021: 2000, 2022: 1000 } })
        expect(strip.rows[1]).toMatchObject({ site: "b", earlier: 0, later: 1, years: { 2021: 500 } })
    })

    it ("finds the run of busy years that holds most records", () => {
        const strip = getTimeStrip(data, options)
        expect(strip.range).toEqual(["2020-01-01", "2022-01-01"])
        expect([strip.inRange, strip.dated]).toEqual([4500, 4561])
    })

    it ("ignores a placeholder date that is the busiest year", () => {
        const strip = getTimeStrip({ ...data, data: [{ stratifier: "a", rows: [["1869-01-01", 3000], ["2020-01-01", 2000], ["2021-01-01", 2000]] }] }, options)
        expect(strip.range).toEqual(["2020-01-01", "2021-01-01"])
        expect(strip.spikes).toEqual([{ date: "1869-01-01", count: 3000 }])
    })

    it ("reports single dates outside the busy years that hold many records", () => {
        expect(getTimeStrip(data, options).spikes).toEqual([{ date: "1900-01-01", count: 50 }])
    })
})

describe("getDimension", () => {
    it ("matches the same dimension across resources", () => {
        expect(getDimension("enc_class_display")).toBe("class")
        expect(getDimension("class_display")).toBe("class")
        expect(getDimension("observation_code")).toBe("code")
        expect(getDimension("code_display")).toBe("code")
        expect(getDimension("category_code")).toBe("category")
        expect(getDimension("gender")).toBe("gender")
        expect(getDimension("code")).toBe("code")
    })
})

describe("getDimensionMatrix", () => {
    const summary = (label: string, names: [string, number][]) => ({
        label, breakdowns: names.map(([name, values]) => ({ name, label: name, values }))
    }) as ResourceSummary

    it ("puts the shared dimensions in columns, and the rest under other", () => {
        const matrix = getDimensionMatrix([
            summary("Encounters", [["class_display", 6], ["enc_class_display", 5], ["gender", 2], ["servicetype_display", 149]]),
            summary("Patients"  , [["gender", 4], ["race_display", 18]]),
            summary("Conditions", [["code_display", 7900], ["class_display", 3]]),
            summary("Observations", [["observation_code", 15500]]),
        ])
        expect(matrix.dimensions.map(d => [d.key, d.count])).toEqual([["class", 2], ["code", 2], ["gender", 2]])
        expect(matrix.rows[0].cells.class).toMatchObject({ values: 6 })
        expect(matrix.rows[0].cells.class.columns.map(c => c.name)).toEqual(["class_display", "enc_class_display"])
        expect(matrix.rows[0].other.map(c => c.name)).toEqual(["servicetype_display"])
        expect(matrix.rows[1].other.map(c => c.name)).toEqual(["race_display"])
        expect(matrix.rows[3].cells.code).toMatchObject({ values: 15500 })
    })
})
