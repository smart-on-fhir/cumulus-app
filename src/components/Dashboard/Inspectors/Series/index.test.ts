import { getOptions } from "./index"

describe("Series inspector", () => {

    function getProps(type: string) {
        const options: any = {
            chart : { type },
            colors: ["#111111", "#222222"],
            series: [
                { id: "s1", type, colorByPoint: true, data: [["a", 1]] },
                { id: "s2", type, colorByPoint: true, data: [["a", 1]] }
            ]
        }
        return getOptions(options, () => {}, "s1") as any[]
    }

    it ("offers to color the points of columns and bars", () => {
        for (const type of ["column", "bar"]) {
            const props = getProps(type)
            expect(props.find(p => p.name === "Color by Point").value).toBe(true)
            expect(props.find(p => p.name === "Color").disabled).toBe(true)
        }
    })

    it ("doesn't offer to color the points of lines and areas, which Highcharts would draw in gray", () => {
        for (const type of ["line", "spline", "area", "areaspline"]) {
            const props = getProps(type)
            expect(props.find(p => p.name === "Color by Point")).toBeUndefined()
            expect(props.find(p => p.name === "Color").disabled).toBe(false)
        }
    })
})
