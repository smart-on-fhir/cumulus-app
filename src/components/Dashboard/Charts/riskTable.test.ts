import { describe, it, expect } from "vitest"
import Highcharts from "../../../highcharts"
import { MIN_PLOT_HEIGHT, RISK_TABLE_CLASS, RISK_TABLE_HEADING, scaleFontSize, withRiskTable } from "./riskTable"


function point(atRisk: number, extra: Record<string, any> = {}) {
    return { y: 50, ...extra, custom: { survival: { atRisk } } }
}

function curve(id: string, data: any[], extra: Record<string, any> = {}) {
    return { id, name: id.replace("primary-", ""), type: "line", color: "#123456", data, ...extra }
}

// Calls a row's label formatter the way Highcharts would. `slot` is the space
// between two ticks in px.
function label(row: any, pos: number, slot = 100, fontSize = 10) {
    return row.labels.formatter.call({
        pos,
        axis: {
            tickInterval : 1,
            tickPositions: [0, 1, 2, 3],
            toPixels     : (value: number) => value * slot,
            labelMetrics : () => ({ f: fontSize })
        }
    })
}

describe("withRiskTable", () => {

    it ("leaves charts without survival curves alone", () => {
        const options: any = { xAxis: { type: "category" }, series: [curve("primary-a", [{ y: 1 }])] }
        expect(withRiskTable(options)).toBe(options)
    })

    it ("adds one row per visible curve under the x axis", () => {
        const options: any = {
            xAxis : { type: "category", reversed: false, title: { text: "Time" } },
            series: [
                curve("primary-a", [point(10)], { color: "#ff0000" }),
                curve("primary-b", [point(20)], { visible: false }),
                curve("primary-c", [point(30)], { color: "#0000ff" }),
                { id: "primary-a (95% CI)", type: "arearange", data: [point(10)] }
            ]
        }
        const xAxis = withRiskTable(options).xAxis as any[]

        // The x axis stays first and unchanged
        expect(xAxis[0]).toBe(options.xAxis)

        expect(xAxis.slice(1)).toMatchObject([
            { linkedTo: 0, className: RISK_TABLE_CLASS, type: "category", reversed: false, title: { text: RISK_TABLE_HEADING, textAlign: "right", style: { fontWeight: "bold" } }, labels: { enabled: false } },
            { linkedTo: 0, className: RISK_TABLE_CLASS, type: "category", reversed: false, title: { text: "a", style: { color: "#ff0000" } }, labels: { style: { color: "#ff0000" } } },
            { linkedTo: 0, className: RISK_TABLE_CLASS, type: "category", reversed: false, title: { text: "c", style: { color: "#0000ff" } }, labels: { style: { color: "#0000ff" } } }
        ])
    })

    it ("uses a smaller font than the x axis labels and little space between rows", () => {
        const [, heading, a, b] = withRiskTable({
            xAxis : { type: "category", labels: { style: { fontSize: "1.2em" } } },
            series: [curve("primary-a", [point(10)]), curve("primary-b", [point(20)])] as any
        }).xAxis as any[]
        expect(heading).toMatchObject({ margin: 10, title: { style: { fontSize: "1.104em" } } })
        expect(a).toMatchObject({ margin: 5 , labels: { style: { fontSize: "1.104em" } }, title: { style: { fontSize: "1.104em" } } })
        expect(b).toMatchObject({ margin: 5 , labels: { style: { fontSize: "1.104em" } }, title: { style: { fontSize: "1.104em" } } })
    })

    it ("does not change the saved options", () => {
        const options: any = { xAxis: { type: "category" }, series: [curve("primary-a", [point(10)])] }
        withRiskTable(options)
        expect(options.xAxis).toEqual({ type: "category" })
        expect(options.chart).toBeUndefined()
    })

    it ("shows the number at risk of each time point", () => {
        // Category axis: the tick position is the point index
        const [, , row] = withRiskTable({
            xAxis : { type: "category" },
            series: [curve("primary-a", [point(1200), point(800), null, point(0)])] as any
        }).xAxis as any[]
        expect([0, 1, 2, 3].map(pos => label(row, pos))).toEqual(["1,200", "800", "", "0"])

        // Linear axis: the tick position is x
        const [, , linear] = withRiskTable({
            xAxis : { type: "linear" },
            series: [curve("primary-a", [point(9, { x: 0 }), point(5, { x: 2 })])] as any
        }).xAxis as any[]
        expect([0, 1, 2].map(pos => label(linear, pos))).toEqual(["9", "", "5"])
    })

    it ("skips time points in every row when the numbers don't fit", () => {
        const options: any = {
            xAxis : { type: "category" },
            series: [
                curve("primary-a", [point(1000), point(900), point(800), point(700)]),
                curve("primary-b", [point(5), point(4), point(3), point(2)])
            ]
        }
        const [, , a, b] = withRiskTable(options).xAxis as any[]

        // "1,000" at 10px is about 30px wide (+ 8px padding)
        expect([0, 1, 2, 3].map(pos => label(a, pos, 40))).toEqual(["1,000", "900", "800", "700"])
        expect([0, 1, 2, 3].map(pos => label(a, pos, 20))).toEqual(["1,000", "", "800", ""])

        // The short numbers follow the widest one, so the rows stay lined up
        expect([0, 1, 2, 3].map(pos => label(b, pos, 20))).toEqual(["5", "", "3", ""])
    })
})

describe("withRiskTable in a chart", () => {

    it ("renders a row of numbers per curve and removes them when turned off", () => {
        const container = document.createElement("div")
        document.body.appendChild(container)

        const options: any = {
            chart : { type: "line", width: 600, height: 400 },
            xAxis : { type: "category", title: { text: "Time" } },
            series: [
                curve("primary-a", [point(10, { name: "0" }), point(8, { name: "1" })]),
                curve("primary-b", [point(20, { name: "0" }), point(15, { name: "1" })])
            ]
        }

        const chart = Highcharts.chart(container, withRiskTable(options))
        expect(chart.xAxis).toHaveLength(4)
        const rows = container.querySelectorAll(`.highcharts-xaxis-labels.${RISK_TABLE_CLASS}`)
        expect(Array.from(rows).map(row => row.textContent).filter(Boolean)).toEqual(["108", "2015"])
        const titles = container.querySelectorAll(`.highcharts-xaxis.${RISK_TABLE_CLASS} .highcharts-axis-title`)
        expect(Array.from(titles).map(title => title.textContent)).toEqual([RISK_TABLE_HEADING, "a", "b"])

        // The heading is right-aligned, like the group names
        expect(titles[0].getAttribute("text-anchor")).toBe("end")
        expect(titles[0].getAttribute("x")).toBe(titles[1].getAttribute("x"))

        chart.update(options, true, true, false)
        expect(chart.xAxis).toHaveLength(1)
        expect(container.querySelectorAll(`.${RISK_TABLE_CLASS}`)).toHaveLength(0)

        chart.destroy()
        container.remove()
    })
})

describe("scaleFontSize", () => {
    it ("scales sizes in any unit", () => {
        expect(scaleFontSize("1.2em", 0.5)).toBe("0.6em")
        expect(scaleFontSize("12px" , 0.5)).toBe("6px")
        expect(scaleFontSize(12     , 0.5)).toBe("6px")
        expect(scaleFontSize("80%"  , 0.5)).toBe("40%")
    })
    it ("scales the default size when there is none", () => {
        expect(scaleFontSize(undefined, 0.85)).toBe("0.85em")
        expect(scaleFontSize("large", 0.85)).toBe("0.85em")
    })
})

describe("the space for the group names", () => {

    // jsdom can't measure text, so every character is 6px wide here
    beforeEach(() => {
        const getBBox = Highcharts.SVGElement.prototype.getBBox
        vi.spyOn(Highcharts.SVGElement.prototype, "getBBox").mockImplementation(function(this: any, ...args: any[]) {
            const box = getBBox.apply(this, args as any)
            return this.textStr === undefined ? box : { ...box, width: String(this.textStr).length * 6, height: 12 }
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    function render(names: string[], width = 600, options: any = {}) {
        const container = document.createElement("div")
        document.body.appendChild(container)
        const chart = Highcharts.chart(container, withRiskTable({
            chart : { type: "line", width, height: 400, ...options.chart },
            xAxis : { type: "category" },
            series: names.map(name => ({ ...curve(name, [point(10, { name: "0" }), point(8, { name: "1" })]), name })) as any
        }))
        const result = { plotLeft: chart.plotLeft, spacingLeft: (chart as any).spacing[3], yAxisOffset: (chart.yAxis[0] as any).offset }
        chart.destroy()
        container.remove()
        return result
    }

    it ("makes the left side as wide as the widest name", () => {
        const short = render(["a"])
        const long  = render(["a", "a very long group name"]) // 22 x 6 = 132px
        expect(long.plotLeft - long.spacingLeft).toBeGreaterThanOrEqual(132 + 8)
        expect(long.plotLeft).toBeGreaterThan(short.plotLeft)

        // The y axis stays next to the plot
        expect(Math.abs(long.yAxisOffset)).toBe(0)
    })

    it ("makes room for the heading too", () => {
        // "Number at risk" is 14 x 6 = 84px wide
        const { plotLeft, spacingLeft } = render(["a"])
        expect(plotLeft - spacingLeft).toBeGreaterThanOrEqual(84 + 8)
    })

    it ("lets the names take at most 30% of the chart width", () => {
        const { plotLeft, spacingLeft } = render(["x".repeat(100)], 600)
        expect(plotLeft - spacingLeft).toBeLessThanOrEqual(180 + 1)
    })

    it ("leaves a fixed left margin alone", () => {
        expect(render(["a very long group name"], 600, { chart: { marginLeft: 50 } }).plotLeft).toBe(50)
    })
})

describe("the chart height", () => {

    // jsdom can't measure text, so every text is 12px tall here
    beforeEach(() => {
        const getBBox = Highcharts.SVGElement.prototype.getBBox
        vi.spyOn(Highcharts.SVGElement.prototype, "getBBox").mockImplementation(function(this: any, ...args: any[]) {
            const box = getBBox.apply(this, args as any)
            return this.textStr === undefined ? box : { ...box, width: String(this.textStr).length * 6, height: 12 }
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    function setup(groups: number, height: number, width = 600) {
        const container = document.createElement("div")
        document.body.appendChild(container)
        const options: any = {
            chart : { type: "line", width, height },
            xAxis : { type: "category" },
            series: Array.from({ length: groups }, (_, i) => curve("primary-" + i, [point(10, { name: "0" }), point(8, { name: "1" })]))
        }
        const chart: any = Highcharts.chart(container, withRiskTable(options))
        return { container, chart, options }
    }

    it ("grows when the table leaves too little room for the plot", () => {
        const { container, chart, options } = setup(12, 300)
        // jsdom drops the aspect-ratio style, so the height it was made for is
        // checked instead
        const height = Number(container.getAttribute("data-risk-table-height"))
        expect(height).toBeGreaterThan(300)
        expect(height).toBe(Math.ceil(chart.chartHeight - chart.plotHeight + MIN_PLOT_HEIGHT))

        // Back to normal without the table
        chart.update(options, true, true, false)
        expect(container.hasAttribute("data-risk-table-height")).toBe(false)

        chart.destroy()
        container.remove()
    })

    it ("does not change when the plot has enough room", () => {
        // 1200 x 720 is the usual 5:3 shape
        const { container, chart } = setup(1, 720, 1200)
        expect(container.hasAttribute("data-risk-table-height")).toBe(false)
        chart.destroy()
        container.remove()
    })
})
