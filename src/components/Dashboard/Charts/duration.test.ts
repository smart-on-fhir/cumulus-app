import { parseDuration } from "./duration"

describe("parseDuration", () => {

    it ("parses numbers", () => {
        expect(parseDuration(0)).toEqual({ value: 0, bound: "exact" })
        expect(parseDuration(3)).toEqual({ value: 3, bound: "exact" })
        expect(parseDuration(2.5)).toEqual({ value: 2.5, bound: "exact" })
    })

    it ("parses numeric strings", () => {
        expect(parseDuration("0")).toEqual({ value: 0, bound: "exact" })
        expect(parseDuration("12")).toEqual({ value: 12, bound: "exact" })
        expect(parseDuration(" 2.5 ")).toEqual({ value: 2.5, bound: "exact" })
    })

    it ("parses open-ended tails", () => {
        expect(parseDuration(">=5")).toEqual({ value: 5, bound: "above" })
        expect(parseDuration(">= 5")).toEqual({ value: 5, bound: "above" })
        expect(parseDuration("≥5")).toEqual({ value: 5, bound: "above" })
        expect(parseDuration(">5")).toEqual({ value: 5, bound: "above" })
        expect(parseDuration("5+")).toEqual({ value: 5, bound: "above" })
    })

    it ("parses lower buckets", () => {
        expect(parseDuration("<1")).toEqual({ value: 1, bound: "below" })
        expect(parseDuration("<=1")).toEqual({ value: 1, bound: "below" })
        expect(parseDuration("≤ 1")).toEqual({ value: 1, bound: "below" })
    })

    it ("rejects values that do not look like durations", () => {
        expect(parseDuration("female")).toBeNull()
        expect(parseDuration("Crohn's disease")).toBeNull()
        expect(parseDuration("2020-01-01")).toBeNull()
        expect(parseDuration("1-2")).toBeNull()
        expect(parseDuration("")).toBeNull()
        expect(parseDuration("-1")).toBeNull()
        expect(parseDuration(-1)).toBeNull()
        expect(parseDuration(NaN)).toBeNull()
        expect(parseDuration(Infinity)).toBeNull()
    })
})
