import { expect } from "chai"
import { toDashboardDataType } from "../../backend/routes/aggregator"
import {
    confirmedOverrides,
    fitsDataType,
    guessedOverrides
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
})
