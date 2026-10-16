import { expect } from "chai"
import { MAX_AGGREGATOR_FILTER_GROUPS, toAggregatorFilters } from "../../backend/aggregatorFilters"


describe("toAggregatorFilters", () => {

    it ("returns no filters for no filters", () => {
        expect(toAggregatorFilters([])).to.deep.equal([])
        expect(toAggregatorFilters([""])).to.deep.equal([])
    })

    it ("keeps a single condition", () => {
        expect(toAggregatorFilters(["a:strEq:x"])).to.deep.equal(["a:strEq:x"])
    })

    it ("joins AND-ed filters into one group", () => {
        expect(toAggregatorFilters(["a:strEq:x", "b:strEq:y", "c:isTrue"])).to.deep.equal(["a:strEq:x,b:strEq:y,c:isTrue"])
    })

    it ("splits a single OR chain into one group per condition", () => {
        expect(toAggregatorFilters(["a:strEq:x,a:strEq:y"])).to.deep.equal(["a:strEq:x", "a:strEq:y"])
    })

    it ("distributes OR chains over AND", () => {
        // (a OR b) AND c -> (a AND c) OR (b AND c)
        expect(toAggregatorFilters(["a,b", "c"])).to.deep.equal(["a,c", "b,c"])

        // (a OR b) AND (c OR d) -> ac OR ad OR bc OR bd
        expect(toAggregatorFilters(["a,b", "c,d"])).to.deep.equal(["a,c", "a,d", "b,c", "b,d"])
    })

    it ("ignores empty conditions and chains", () => {
        expect(toAggregatorFilters(["a,,b", "", ",c,"])).to.deep.equal(["a,c", "b,c"])
    })

    it ("rejects filters that would need too many groups", () => {
        // 11 x 10 = 110 groups
        const chain = (n: number) => Array.from({ length: n }, (_, i) => `a:eq:${i}`).join(",")
        expect(() => toAggregatorFilters([chain(11), chain(10)])).to.throw(/too complex/)
        expect(toAggregatorFilters([chain(10), chain(10)])).to.have.length(MAX_AGGREGATOR_FILTER_GROUPS)
    })
})
