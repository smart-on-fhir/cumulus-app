import { getCountsByTime, lifeTable } from "./kaplanMeier"

describe("lifeTable", () => {

    it ("starts at 100% and shows each drop at the next time point", () => {
        const table = lifeTable(["0", "1", "2"], { "0": 10, "1": 20 }, { "2": 70 })
        expect(table.map(r => r.atRisk)).toEqual([100, 90, 70])
        expect(table.map(r => r.survival)).toEqual([1, 0.9, 0.9 * (1 - 20 / 90)])
    })

    it ("counts censored records as half at risk in the interval they leave", () => {
        const table = lifeTable(["0", "1"], { "0": 10 }, { "0": 20, "1": 70 })
        expect(table[0].atRisk).toBe(100)
        expect(table[1].survival).toBeCloseTo(1 - 10 / (100 - 20 / 2))
    })

    it ("never drops for an open-ended last bucket", () => {
        const table = lifeTable(["4", ">=5"], { "4": 10, ">=5": 30 }, { ">=5": 60 })
        expect(table[1]).toEqual({ x: ">=5", atRisk: 90, events: 30, censored: 60, survival: 0.9 })
    })

    it ("stays flat at time points without events or censoring", () => {
        const table = lifeTable(["0", "1", "2", "3"], { "0": 50 }, { "3": 50 })
        expect(table.map(r => r.survival)).toEqual([1, 0.5, 0.5, 0.5])
    })

    it ("returns null once nobody is left under follow-up", () => {
        const table = lifeTable(["0", "1", "2"], { "0": 10 }, { "0": 10 })
        expect(table.map(r => r.survival)).toEqual([1, null, null])
    })

    it ("handles a series with no records", () => {
        expect(lifeTable(["0", "1"], {}, {}).map(r => r.survival)).toEqual([null, null])
    })
})

describe("getCountsByTime", () => {

    it ("reads unstratified data", () => {
        expect(getCountsByTime({
            column: "t", filters: [], totalCount: 3, rowCount: 2,
            data: [{ rows: [["0", 1], ["1", 2]] }]
        })).toEqual({ "0": 1, "1": 2 })
    })

    it ("reads one group of stratified data", () => {
        expect(getCountsByTime({
            column: "t", stratifier: "g", filters: [], totalCount: 3, rowCount: 2, counts: {},
            data: [
                { stratifier: "a", rows: [["0", 1]] },
                { stratifier: "b", rows: [["0", 5], ["1", 6]] }
            ]
        }, "b")).toEqual({ "0": 5, "1": 6 })
    })

    it ("returns no counts for a missing group or empty data", () => {
        expect(getCountsByTime({
            column: "t", stratifier: "g", filters: [], totalCount: 0, rowCount: 0, counts: {}, data: []
        } as any, "x")).toEqual({})
        expect(getCountsByTime({ column: "t", filters: [], totalCount: 0, rowCount: 0, data: [] } as any)).toEqual({})
    })
})
