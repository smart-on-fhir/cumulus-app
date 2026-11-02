import { getFilterParams, hasRanges, isTurbo, validateData } from "./chartData"
import { TURBO_THRESHOLD }                   from "./config"
import { app }                               from "../../types"


// Labels can be numbers too, although DataResponseRow types them as strings
type Row = [string | number, number] | [string | number, number, number, number]

function getData(rows: Row[], patch: object = {}): app.ServerResponses.UnStratifiedDataResponse {
    return { column: "age", filters: [], totalCount: 100, rowCount: rows.length, data: [{ rows: rows as any }], ...patch }
}

function getStratifiedData(groups: Record<string, Row[]>, patch: object = {}): app.ServerResponses.StratifiedDataResponse {
    return {
        column    : "age",
        stratifier: "gender",
        filters   : [],
        totalCount: 100,
        rowCount  : Object.values(groups).reduce((n, rows) => n + rows.length, 0),
        counts    : {},
        data      : Object.entries(groups).map(([stratifier, rows]) => ({ stratifier, rows: rows as any })),
        ...patch
    }
}

const manyRows = (): Row[] => Array.from({ length: TURBO_THRESHOLD + 1 }, (_, i) => [i, 1])

describe("isTurbo", () => {

    it ("is false for data up to the threshold", () => {
        expect(isTurbo(getData([[1, 1], [2, 1]]))).toBe(false)
    })

    it ("is true for data over the threshold", () => {
        expect(isTurbo(getData(manyRows()))).toBe(true)
    })

    it ("is true if any stratified group is over the threshold", () => {
        expect(isTurbo(getStratifiedData({ male: [[1, 1]], female: manyRows() }))).toBe(true)
    })

    it ("is true if the secondary data is over the threshold", () => {
        expect(isTurbo(getData([[1, 1]]), getStratifiedData({ male: manyRows() }))).toBe(true)
    })
})

describe("hasRanges", () => {

    it ("is true if any row of the data has a range", () => {
        expect(hasRanges(getData([[1, 1], [2, 1, 0.5, 1.5]]), null)).toBe(true)
    })

    it ("is true if any row of the secondary data has a range", () => {
        expect(hasRanges(getData([[1, 1]]), getStratifiedData({ male: [[1, 1, 0.5, 1.5]] }))).toBe(true)
    })

    it ("is falsy without ranges", () => {
        expect(hasRanges(getData([[1, 1]]), getStratifiedData({ male: [[1, 1]] }))).toBeFalsy()
        expect(hasRanges(null, null)).toBeFalsy()
    })
})

describe("validateData", () => {

    describe("unstratified data", () => {

        const expected = { column: "age" }

        it ("accepts valid data", () => {
            expect(() => validateData(getData([[1, 10], [2, 20, 15, 25]]), expected)).not.toThrow()
        })

        it ("rejects a missing response", () => {
            expect(() => validateData(null, expected)).toThrow(/Invalid data response/)
        })

        it ("rejects data for another column", () => {
            expect(() => validateData(getData([[1, 10]]), { column: "gender" })).toThrow(/"column" property/)
        })

        it ("rejects a row count that doesn't match the rows", () => {
            expect(() => validateData(getData([[1, 10]], { rowCount: 2 }), expected)).toThrow(/rowCount/)
        })

        it ("rejects non-numeric counts and ranges", () => {
            expect(() => validateData(getData([[1, "10" as any]]), expected)).toThrow(/rows\[0\]\[1\]/)
            expect(() => validateData(getData([[1, 10, "5" as any, 15]]), expected)).toThrow(/rows\[0\]\[2\]/)
        })

        it ("rejects numeric labels that are not in ascending order", () => {
            expect(() => validateData(getData([[2, 10], [1, 20]]), expected)).toThrow(/not sorted/)
            expect(() => validateData(getData([[1, 10], [1, 20]]), expected)).toThrow(/not sorted/)
        })

        it ("doesn't check the type or the order of other labels", () => {
            expect(() => validateData(getData([["b", 10], ["a", 20], [true as any, 30]]), expected)).not.toThrow()
        })
    })

    describe("stratified data", () => {

        const expected = { column: "age", stratifier: "gender" }

        it ("accepts valid data", () => {
            expect(() => validateData(getStratifiedData({ male: [[1, 10]], female: [[1, 20]] }), expected)).not.toThrow()
        })

        it ("rejects data for another stratifier", () => {
            expect(() => validateData(getStratifiedData({ male: [[1, 10]] }), { column: "age", stratifier: "race" })).toThrow(/"stratifier" property/)
        })

        it ("rejects duplicate stratifier values", () => {
            const data = getStratifiedData({ male: [[1, 10]] })
            data.data.push({ stratifier: "male", rows: [["2", 20]] })
            expect(() => validateData(data, expected)).toThrow(/Duplicate stratifier "male"/)
        })

        it ("allows equal numeric labels but not descending ones", () => {
            expect(() => validateData(getStratifiedData({ male: [[1, 10], [1, 20]] }), expected)).not.toThrow()
            expect(() => validateData(getStratifiedData({ male: [[2, 10], [1, 20]] }), expected)).toThrow(/not sorted/)
        })
    })
})

describe("getFilterParams", () => {

    function filter(left: string, operator: string, value?: string | number, join: "and" | "or" = "and"): app.Filter {
        return { left, operator, negated: false, right: { type: "value", value }, join }
    }

    it ("returns no parameters without filters", () => {
        expect(getFilterParams([])).toEqual([])
    })

    it ("converts a filter to column:operator:value", () => {
        expect(getFilterParams([filter("age", "gt", 5)])).toEqual(["age:gt:5"])
    })

    it ("leaves out the value for operators that take none", () => {
        for (const op of ["isTrue", "isFalse", "isNotTrue", "isNotFalse", "isNotNone", "isNone"]) {
            expect(getFilterParams([filter("flag", op)])).toEqual([`flag:${op}`])
        }
    })

    it ("treats isNull as needing a value (the UI doesn't offer it)", () => {
        expect(getFilterParams([filter("age", "isNull", "x")])).toEqual(["age:isNull:x"])
        expect(getFilterParams([filter("age", "isNull")])).toEqual([])
    })

    it ("sends filters joined with and as separate parameters", () => {
        expect(getFilterParams([
            filter("age", "gt", 5),
            filter("gender", "strEq", "male", "and")
        ])).toEqual(["age:gt:5", "gender:strEq:male"])
    })

    it ("combines filters joined with or into one parameter", () => {
        expect(getFilterParams([
            filter("age", "gt", 5),
            filter("age", "lt", 2, "or"),
            filter("gender", "strEq", "male", "and")
        ])).toEqual(["age:gt:5,age:lt:2", "gender:strEq:male"])
    })

    it ("skips incomplete filters", () => {
        expect(getFilterParams([
            filter("", "gt", 5),
            filter("age", "", 5),
            filter("age", "gt"),
            filter("age", "gt", ""),
            filter("age", "gt", 0)
        ])).toEqual(["age:gt:0"])
    })

    it ("ignores the join of the first filter", () => {
        expect(getFilterParams([filter("age", "gt", 5, "or")])).toEqual(["age:gt:5"])
    })
})
