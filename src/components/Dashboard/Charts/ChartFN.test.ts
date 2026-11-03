import { getInspectionMatch, removeStaleShadows } from "./ChartFN"

describe("removeStaleShadows", () => {

    it ("removes the line shadow of series that have it turned off", () => {
        const off  = { options: { shadow: false }, graph: { shadow: vi.fn() } }
        const on   = { options: { shadow: { opacity: 0.4 } }, graph: { shadow: vi.fn() } }
        const none = { options: {}, graph: undefined }
        removeStaleShadows({ series: [off, on, none] } as any)
        expect(off.graph.shadow).toHaveBeenCalledWith(false)
        expect(on.graph.shadow).not.toHaveBeenCalled()
    })
})

describe("getInspectionMatch", () => {

    function svg(html: string, selector: string) {
        const div = document.createElement("div")
        div.innerHTML = `<svg>${html}</svg>`
        return div.querySelector(selector)!
    }

    it ("finds a plot line by the id in its class", () => {
        expect(getInspectionMatch(svg('<path class="highcharts-plot-line x-axis-plot-line-1"/>', "path")))
            .toEqual(["plotLine", { selectedPlotLineId: "x-axis-plot-line-1", selectedPlotLineAxis: "x" }])
        expect(getInspectionMatch(svg('<path class="highcharts-plot-line y-axis-plot-line-0"/>', "path")))
            .toEqual(["plotLine", { selectedPlotLineId: "y-axis-plot-line-0", selectedPlotLineAxis: "y" }])
    })

    it ("finds an annotation by the index of its label in the chart", () => {
        const div = document.createElement("div")
        div.innerHTML = '<svg><g class="highcharts-annotation-label"><text>a</text></g><g class="highcharts-annotation-label"><text>b</text></g></svg>'
        const [a, b] = div.querySelectorAll("g")
        const chart = { annotations: [{ labels: [{ graphic: { element: a } }, { graphic: { element: b } }] }] }
        expect(getInspectionMatch(b.querySelector("text")!, chart)).toEqual(["annotation", { selectedAnnotationIndex: 1 }])
        expect(getInspectionMatch(a, chart)).toEqual(["annotation", { selectedAnnotationIndex: 0 }])
        expect(getInspectionMatch(a)).toEqual(["annotation", { selectedAnnotationIndex: -1 }])
    })

    it ("matches other elements by the inspector selectors", () => {
        expect(getInspectionMatch(svg('<text class="highcharts-title"/>', "text"))).toEqual(["title", {}])
        expect(getInspectionMatch(svg('<g class="highcharts-plot-line-label"><text/></g>', "text"))).toEqual(["plotLineLabel", {}])
    })

    it ("matches nothing else", () => {
        expect(getInspectionMatch(svg('<path class="highcharts-plot-line"/>', "path"))).toBeNull()
        expect(getInspectionMatch(svg('<rect class="something-else"/>', "rect"))).toBeNull()
    })
})
