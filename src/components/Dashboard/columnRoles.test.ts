import { isDurationColumn, isStatusColumn, suggestedFirst } from "./columnRoles"

describe("isDurationColumn", () => {

    it ("matches durations in names with underscores", () => {
        expect(isDurationColumn({ name: "event_free_survival_years" })).toBe(true)
        expect(isDurationColumn({ name: "age_at_diagnosis" })).toBe(true)
        expect(isDurationColumn({ name: "follow_up" })).toBe(true)
        expect(isDurationColumn({ name: "x", label: "Days since admission" })).toBe(true)
    })

    it ("does not match groups, ranges or unrelated columns", () => {
        expect(isDurationColumn({ name: "age_group" })).toBe(false)
        expect(isDurationColumn({ name: "Age Range" })).toBe(false)
        expect(isDurationColumn({ name: "gender" })).toBe(false)
        expect(isDurationColumn({ name: "stage" })).toBe(false)
    })
})

describe("isStatusColumn", () => {

    it ("matches status-like names", () => {
        expect(isStatusColumn({ name: "efs_status" })).toBe(true)
        expect(isStatusColumn({ name: "died" })).toBe(true)
        expect(isStatusColumn({ name: "x", label: "Vital Status" })).toBe(true)
        expect(isStatusColumn({ name: "relapse" })).toBe(true)
    })

    it ("does not match unrelated columns", () => {
        expect(isStatusColumn({ name: "gender" })).toBe(false)
        expect(isStatusColumn({ name: "ibd_subtype" })).toBe(false)
        expect(isStatusColumn({ name: "eventually" })).toBe(false)
    })
})

describe("suggestedFirst", () => {

    it ("puts matching columns first, each group sorted by name", () => {
        const cols = ["gender", "efs_status", "age", "died"].map(name => ({ name }))
        expect(cols.sort(suggestedFirst(isStatusColumn)).map(c => c.name)).toEqual(["died", "efs_status", "age", "gender"])
    })
})
