import { getOptions } from "./Line"

describe("Line series inspector", () => {

    function getStep(isSurvival: boolean) {
        const options: any = {
            chart : { type: "line" },
            custom: { isSurvival },
            series: [{ id: "s1", type: "line", step: "left" }]
        }
        return getOptions(options, () => {}, "s1").find(p => p.name === "Step") as any
    }

    it ("lets users change the step of line charts", () => {
        expect(getStep(false).disabled).toBe(false)
    })

    it ("disables the step of survival charts, which is always left", () => {
        const step = getStep(true)
        expect(step.disabled).toBe(true)
        expect(step.value).toBe("left")
        expect(step.description).toContain("always drawn with left steps")
    })
})
