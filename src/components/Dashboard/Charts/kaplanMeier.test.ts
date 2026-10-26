import { chiSquareSurvival, confidenceInterval, getCountsByTime, lifeTable, logRankTest } from "./kaplanMeier"

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
        expect(table[1]).toMatchObject({ x: ">=5", atRisk: 90, events: 30, censored: 60, survival: 0.9 })
    })

    it ("stays flat at time points without events or censoring", () => {
        const table = lifeTable(["0", "1", "2", "3"], { "0": 50 }, { "3": 50 })
        expect(table.map(r => r.survival)).toEqual([1, 0.5, 0.5, 0.5])
    })

    it ("ends at the time point after the last records, and is null after that", () => {
        // 20 at risk, 10 events and 10 censored at "0" (effective 15)
        const table = lifeTable(["0", "1", "2"], { "0": 10 }, { "0": 10 })
        expect(table.map(r => r.survival)).toEqual([1, 1 - 10 / 15, null])
    })

    it ("drops to 0 when its last records had the event", () => {
        // e.g. a group whose 2 records both had the event in the first year
        const table = lifeTable(["0", "1", "2", ">=5"], { "0": 2 }, {})
        expect(table.map(r => r.survival)).toEqual([1, 0, null, null])
    })

    it ("handles a series with no records", () => {
        expect(lifeTable(["0", "1"], {}, {}).map(r => r.survival)).toEqual([null, null])
    })
})

describe("lifeTable confidence interval", () => {

    it ("is zero width at the start", () => {
        const table = lifeTable(["0", "1"], { "0": 10 }, { "1": 90 })
        expect(table[0]).toMatchObject({ survival: 1, ciLow: 1, ciHigh: 1 })
    })

    it ("uses Greenwood's formula on the log-log scale", () => {
        // 100 at risk, 10 events: S = 0.9, var(log S) = 10 / (100 * 90)
        const table = lifeTable(["0", "1"], { "0": 10 }, { "1": 90 })
        const se = Math.sqrt(10 / (100 * 90)) / Math.abs(Math.log(0.9))
        expect(table[1].ciLow ).toBeCloseTo(0.9 ** Math.exp( 1.96 * se), 10)
        expect(table[1].ciHigh).toBeCloseTo(0.9 ** Math.exp(-1.96 * se), 10)
    })

    it ("accumulates the variance over time points, using the effective number at risk", () => {
        // "0": 100 at risk, 10 events, 20 censored -> effective 90
        // "1":  70 at risk, 14 events              -> effective 70
        const table = lifeTable(["0", "1", "2"], { "0": 10, "1": 14 }, { "0": 20, "2": 56 })
        const s = (1 - 10 / 90) * (1 - 14 / 70)
        const se = Math.sqrt(10 / (90 * 80) + 14 / (70 * 56)) / Math.abs(Math.log(s))
        expect(table[2].survival).toBeCloseTo(s, 10)
        expect(table[2].ciLow   ).toBeCloseTo(s ** Math.exp( 1.96 * se), 10)
        expect(table[2].ciHigh  ).toBeCloseTo(s ** Math.exp(-1.96 * se), 10)
    })

    it ("stays within 0 and 1, without being cut", () => {
        // 3 at risk, 2 events: S = 1/3, with a very wide interval
        const table = lifeTable(["0", "1"], { "0": 2 }, { "1": 1 })
        expect(table[1].ciLow ).toBeGreaterThan(0)
        expect(table[1].ciHigh).toBeLessThan(1)
        expect(table[1].ciLow ).toBeLessThan(table[1].survival!)
        expect(table[1].ciHigh).toBeGreaterThan(table[1].survival!)
    })

    it ("is narrower on the side closer to 100%", () => {
        const [, row] = lifeTable(["0", "1"], { "0": 5 }, { "1": 95 })
        expect(row.ciHigh! - row.survival!).toBeLessThan(row.survival! - row.ciLow!)
    })

    it ("matches a published Stata estimate", () => {
        // SHH group in the CBTN medulloblastoma manuscript (Table 3): 16
        // patients, 3-year EFS 0.81 [0.52, 0.94]. Assuming 3 events and no
        // censoring: S = 13/16
        const [low, high] = confidenceInterval(13 / 16, 3 / (16 * 13))
        expect([+low.toFixed(2), +high.toFixed(2)]).toEqual([0.52, 0.94])
    })

    it ("is null after the curve ends", () => {
        const table = lifeTable(["0", "1", "2"], { "0": 10 }, {})
        expect(table[1]).toMatchObject({ survival: 0, ciLow: 0, ciHigh: 0 })
        expect(table[2]).toMatchObject({ survival: null, ciLow: null, ciHigh: null })
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

describe("chiSquareSurvival", () => {
    it ("matches known critical values", () => {
        expect(chiSquareSurvival(3.841459, 1)).toBeCloseTo(0.05, 6)
        expect(chiSquareSurvival(5.991465, 2)).toBeCloseTo(0.05, 6)
        expect(chiSquareSurvival(6.634897, 1)).toBeCloseTo(0.01, 6)
        expect(chiSquareSurvival(11.34487, 3)).toBeCloseTo(0.01, 6)
        expect(chiSquareSurvival(1, 4)).toBeCloseTo(0.909796, 5)
        expect(chiSquareSurvival(0, 1)).toBe(1)
    })
})

describe("logRankTest", () => {

    const table = (rows: [number, number][]) => rows.map(([atRisk, events]) => ({ atRisk, events }))

    it ("needs at least two groups with records", () => {
        expect(logRankTest([])).toBeNull()
        expect(logRankTest([table([[10, 1]])])).toBeNull()
        expect(logRankTest([table([[10, 1]]), table([[0, 0]])])).toBeNull()
    })

    it ("finds no difference between identical groups", () => {
        const a = table([[20, 2], [15, 3], [10, 1]])
        expect(logRankTest([a, a])).toMatchObject({ chi2: 0, df: 1, p: 1 })
    })

    it ("matches the two-group formula", () => {
        const a = table([[20, 1], [18, 2], [14, 1]])
        const b = table([[20, 5], [13, 4], [8, 3]])

        // (O - E)² / V for group a
        let O = 0, E = 0, V = 0
        a.forEach((ra, j) => {
            const rb = b[j], N = ra.atRisk + rb.atRisk, D = ra.events + rb.events
            O += ra.events
            E += ra.atRisk * D / N
            V += D * (N - D) / (N - 1) * (ra.atRisk / N) * (1 - ra.atRisk / N)
        })
        const result = logRankTest([a, b])!
        expect(result.chi2).toBeCloseTo((O - E) ** 2 / V, 10)
        expect(result.df).toBe(1)
        expect(result.p).toBeCloseTo(chiSquareSurvival((O - E) ** 2 / V, 1), 10)
    })

    it ("compares any number of groups", () => {
        const result = logRankTest([
            table([[30, 1], [29, 1], [28, 1]]),
            table([[30, 5], [25, 5], [20, 5]]),
            table([[30, 2], [28, 2], [26, 2]])
        ])!
        expect(result.df).toBe(2)
        expect(result.p).toBeLessThan(0.05)
    })

    it ("ignores groups without records", () => {
        const a = table([[20, 1], [18, 2]]), b = table([[20, 5], [13, 4]])
        expect(logRankTest([a, table([[0, 0], [0, 0]]), b])).toEqual(logRankTest([a, b]))
    })
})
