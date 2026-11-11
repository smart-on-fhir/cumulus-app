import { expect } from "chai"
import { createServer, Server } from "node:http"
import { AddressInfo } from "node:net"
import config from "../../backend/config"
import { toDashboardDataType } from "../../backend/routes/aggregator"
import type { DataPackage } from "../../backend/routes/aggregator"
import {
    confirmedOverrides,
    fitsDataType,
    guessedOverrides,
    verifyColumnTypes
} from "../../backend/aggregatorColumnTypes"

function columns(types: Record<string, string>): any {
    return Object.fromEntries(Object.entries(types).map(([name, dataType]) => [name, { name, dataType }]))
}

describe("Aggregator column data types", () => {

    it ("maps aggregator date types to dashboard date types", () => {
        expect(toDashboardDataType("year"  )).to.equal("date:YYYY")
        expect(toDashboardDataType("month" )).to.equal("date:YYYY-MM")
        expect(toDashboardDataType("week"  )).to.equal("date:YYYY-MM-DD")
        expect(toDashboardDataType("day"   )).to.equal("date:YYYY-MM-DD")
        expect(toDashboardDataType("date"  )).to.equal("date:YYYY-MM-DD")
        expect(toDashboardDataType("string")).to.equal("string")
    })

    it ("fitsDataType is strict", () => {
        expect(fitsDataType("integer"        , ["1", 2, "-3"  ])).to.equal(true)
        expect(fitsDataType("integer"        , ["1", ">=5"    ])).to.equal(false)
        expect(fitsDataType("integer"        , ["5+"          ])).to.equal(false)
        expect(fitsDataType("integer"        , ["1.5"         ])).to.equal(false)
        expect(fitsDataType("float"          , ["1.5", 2, ".5"])).to.equal(true)
        expect(fitsDataType("boolean"        , [true, "false" ])).to.equal(true)
        expect(fitsDataType("date:YYYY-MM-DD", [true          ])).to.equal(false)
        expect(fitsDataType("string"         , [">=5"         ])).to.equal(true)
        expect(fitsDataType("date:YYYY-MM-DD", ["2024-01-02", "2024-01-02T00:00:00Z"])).to.equal(true)
    })

    it ("fitsDataType skips placeholders but needs at least one real value", () => {
        expect(fitsDataType("integer", [null, "", "cumulus__none", "4"])).to.equal(true)
        expect(fitsDataType("integer", [null, null])).to.equal(false)
    })

    it ("guesses only where the name disagrees with the declared type", () => {
        expect(guessedOverrides(columns({
            cnt                      : "integer",
            age_at_visit             : "string",
            event_free_survival_years: "string",
            valid_birth_date         : "boolean",
            gender                   : "string"
        }))).to.deep.equal({
            age_at_visit             : "integer",
            event_free_survival_years: "integer",
            valid_birth_date         : "date:YYYY-MM-DD"
        })
    })

    it ("keeps only the guesses the data confirms", () => {
        const guesses = {
            age_at_visit             : "integer",
            event_free_survival_years: "integer",
            valid_birth_date         : "date:YYYY-MM-DD"
        }
        const rows = [
            { age_at_visit: null, event_free_survival_years: null , valid_birth_date: null  },
            { age_at_visit: "11", event_free_survival_years: "1"  , valid_birth_date: true  },
            { age_at_visit: "42", event_free_survival_years: ">=5", valid_birth_date: false }
        ]
        expect(confirmedOverrides(guesses, rows)).to.deep.equal({ age_at_visit: "integer" })
    })

    describe("verification download limit", () => {
        let server: Server
        let requests = 0
        let originalAggregator: typeof config.aggregator

        before(async () => {
            originalAggregator = { ...config.aggregator }
            server = createServer((_req, res) => {
                requests++
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify({ data: [{ age_at_visit: "42" }] }))
            })
            await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve))
            config.aggregator.enabled = true
            config.aggregator.apiKey = "test-key"
            config.aggregator.baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
        })

        after(async () => {
            Object.assign(config.aggregator, originalAggregator)
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
        })

        function packageWithTotal(total: number): DataPackage {
            return {
                id: `threshold-test-${total}`,
                total,
                s3_path: "threshold-test",
                column_types_format_version: "1",
                last_data_update: "",
                name: "threshold-test",
                study: "test",
                version: "001",
                columns: {
                    age_at_visit: { name: "age_at_visit", type: "string", dataType: "string", label: "", description: "" },
                    age_group: { name: "age_group", type: "integer", dataType: "integer", label: "", description: "" }
                }
            }
        }

        for (const total of [999_999, 1_000_000]) {
            it(`downloads and verifies packages with total ${total}`, async () => {
                const before = requests
                const result = await verifyColumnTypes(packageWithTotal(total))
                expect(requests - before).to.equal(1)
                expect(result.columns.age_at_visit.dataType).to.equal("integer")
                expect(result.columns.age_group.dataType).to.equal("string")
            })
        }

        for (const total of [1_000_001, 15_866_135]) {
            it(`skips the download for packages with total ${total}`, async () => {
                const before = requests
                const result = await verifyColumnTypes(packageWithTotal(total))
                expect(requests - before).to.equal(0)
                expect(result.columns.age_at_visit.dataType).to.equal("string")
                expect(result.columns.age_group.dataType).to.equal("string")
            })
        }
    })
})
