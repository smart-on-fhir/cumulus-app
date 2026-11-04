import { getOptions } from "./Axis"


describe("Axis inspector", () => {
    const names = (isXAxis?: boolean) => getOptions({}, () => {}, isXAxis).map(o => o.name)

    it ("offers to reverse the Y axis", () => {
        expect(names()).toContain("Reversed")
    })

    it ("doesn't offer to reverse the X axis, which follows the sort option", () => {
        expect(names(true)).not.toContain("Reversed")
    })
})
