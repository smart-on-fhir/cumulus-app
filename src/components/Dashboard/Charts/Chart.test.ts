import {
    buildChartOptions,
    removeSurvivalTitles,
    emToPx,
    filterOutExceptions,
    getChartTitleText,
    getDateFormat,
    getXType,
    pct,
} from "./lib"
import { CUMULUS__NONE, DEFAULT_FONT_SIZE } from "../config"
import { roundToPrecision } from "../../../utils"


describe("Chart", () => {

    it ('emToPx', () => {
        expect(emToPx(3)).to.equal(3 * DEFAULT_FONT_SIZE + "px")
    })

    it ('pct', () => {
        expect(pct(3)).to.equal(3)
        expect(pct(3, 30)).to.equal(10)
    })
    
    it ('getChartTitleText', () => {
        expect(getChartTitleText({
            name: "Column1",
            label: "",
            dataType: "string",
            description: ""
        })).toEqual("Column1");

        expect(getChartTitleText({
            name: "Column1",
            label: "Column 1 Label",
            dataType: "string",
            description: ""
        })).toEqual("Column 1 Label");

        expect(getChartTitleText({
            name: "Column1",
            label: "",
            dataType: "string",
            description: ""
        }, {
            name: "Column2",
            label: "",
            dataType: "string",
            description: ""
        })).toEqual("Column1 by Column2");

        expect(getChartTitleText({
            name: "Column1",
            label: "Column 1 Label",
            dataType: "string",
            description: ""
        }, {
            name: "Column2",
            label: "Column 2 Label",
            dataType: "string",
            description: ""
        })).toEqual("Column 1 Label by Column 2 Label");
    })

    it ('getXType', () => {
        expect(getXType({ name: "x", label: "", dataType: "string"         , description: "" })).toEqual("category");
        expect(getXType({ name: "x", label: "", dataType: "integer"        , description: "" })).toEqual("linear"  );
        expect(getXType({ name: "x", label: "", dataType: "float"          , description: "" })).toEqual("linear"  );
        expect(getXType({ name: "x", label: "", dataType: "boolean"        , description: "" })).toEqual("category");
        expect(getXType({ name: "x", label: "", dataType: "date:YYYY"      , description: "" })).toEqual("datetime");
        expect(getXType({ name: "x", label: "", dataType: "date:YYYY-MM"   , description: "" })).toEqual("datetime");
        expect(getXType({ name: "x", label: "", dataType: "date:YYYY-MM-DD", description: "" })).toEqual("datetime");
    })

    it ("getDateFormat", () => {
        expect(getDateFormat({ name: "x", label: "", dataType: "date:YYYY"      , description: "" })).toEqual("%Y"        );
        expect(getDateFormat({ name: "x", label: "", dataType: "date:YYYY-MM"   , description: "" })).toEqual("%Y-%m"     );
        expect(getDateFormat({ name: "x", label: "", dataType: "date:YYYY-MM-DD", description: "" })).toEqual("%Y-%m-%d"  );
        expect(getDateFormat({ name: "x", label: "", dataType: "date:YYYY"      , description: "" }, true)).toEqual("YYYY"      );
        expect(getDateFormat({ name: "x", label: "", dataType: "date:YYYY-MM"   , description: "" }, true)).toEqual("YYYY-MM"   );
        expect(getDateFormat({ name: "x", label: "", dataType: "date:YYYY-MM-DD", description: "" }, true)).toEqual("YYYY-MM-DD");
    })

    it ('filterOutExceptions', () => {
        const exceptions = new Set<string>();

        const date = new Date().toString()

        const data: [any, any, any?, any?][] = [
            ["a", 1],
            [CUMULUS__NONE, 2],
            [2, 4],
            [3, 5],
            [date, 6],
        ];

        filterOutExceptions({
            rows: data,
            seriesName: "Series 1",
            xType: "linear",
            exceptions,
            column: {
                name: "Col1",
                dataType: "integer",
                label: "Col 1",
                description: "Col 1 Description"
            }
        })

        const result = Array.from(exceptions)
        expect(result.length).to.equal(3)

        expect(result[0]).to.equal('There is <b>1</b> record in the <b>Series 1</b> series where <b>Col 1</b> equals <b>a</b>')
        expect(result[1]).to.equal('There are <b>2</b> records in the <b>Series 1</b> series where <b>Col 1</b> is empty in the source data')
        expect(result[2]).to.equal('There are <b>6</b> records in the <b>Series 1</b> series where <b>Col 1</b> equals <b>' + date + '</b>')
    })

    it ('filterOutExceptions on datetime axis', () => {
        const exceptions = new Set<string>();

        const date = new Date().toString()

        const data: [any, any, any?, any?][] = [
            ["a", 1],
            [CUMULUS__NONE, 2],
            [2, 4],
            [3, 5],
            [date, 6],
        ];

        filterOutExceptions({
            rows: data,
            seriesName: "Series 1",
            xType: "datetime",
            exceptions,
            column: {
                name: "Col1",
                dataType: "integer",
                label: "Col 1",
                description: "Col 1 Description"
            }
        })

        const result = Array.from(exceptions)
        // console.log(result)
        expect(result.length).to.equal(3)

        expect(result[0]).to.equal('There is <b>1</b> record in the <b>Series 1</b> series where <b>Col 1</b> equals <b>a</b>')
        expect(result[1]).to.equal('There are <b>2</b> records in the <b>Series 1</b> series where <b>Col 1</b> is empty in the source data')
        expect(result[2]).to.equal('There are <b>6</b> records in the <b>Series 1</b> series where <b>Col 1</b> equals <b>' + date + '</b>')
    })

    it ("supports non-string stratifier values, as returned by the aggregator", () => {
        const options = buildChartOptions({
            type: "line",
            data: {
                column    : "t",
                stratifier: "g",
                filters   : [],
                totalCount: 4,
                rowCount  : 4,
                counts    : { "0": 2, "1": 2 },
                data      : [
                    { stratifier: 1    as any, rows: [["0", 1], ["1", 1]] },
                    { stratifier: true as any, rows: [["0", 1], ["1", 1]] }
                ]
            },
            data2  : null,
            column : { name: "t", label: "T", dataType: "string" , description: "" },
            groupBy: { name: "g", label: "G", dataType: "integer", description: "" },
            sortBy : "x:asc",
            limit  : 0,
            offset : 0
        })
        expect(options.series!.map(s => s.id)).toEqual(["primary-1", "primary-true"])
        expect(options.series!.map(s => s.name)).toEqual(["1", "true"])
    })

    describe("legend click", () => {

        function build(onSeriesToggle: (map: Record<string, boolean>) => void, inspection = false) {
            return buildChartOptions({
                type: "line",
                data: { column: "t", filters: [], totalCount: 1, rowCount: 1, data: [{ rows: [["0", 1]] }] },
                data2: null,
                column: { name: "t", label: "T", dataType: "string", description: "" },
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                onSeriesToggle,
                inspection: { enabled: inspection } as any
            })
        }

        function click(options: ReturnType<typeof buildChartOptions>, legendItem: any) {
            const event = { legendItem, preventDefault: vi.fn() }
            ;(options.legend!.events!.itemClick as any)(event)
            return event
        }

        const a: any = { userOptions: { id: "a" }, visible: true  }
        const b: any = { userOptions: { id: "b" }, visible: false }
        a.chart = b.chart = { series: [a, b] }

        it ("replaces the default series toggle with a state update", () => {
            const onSeriesToggle = vi.fn()
            const event = click(build(onSeriesToggle), a)
            expect(event.preventDefault).toHaveBeenCalled()
            expect(onSeriesToggle).toHaveBeenCalledWith({ a: false, b: false })
        })

        it ("does not toggle series in inspection mode", () => {
            const onSeriesToggle = vi.fn()
            const event = click(build(onSeriesToggle, true), a)
            expect(event.preventDefault).toHaveBeenCalled()
            expect(onSeriesToggle).not.toHaveBeenCalled()
        })

        it ("keeps the default toggle for points, e.g. pie slices", () => {
            const onSeriesToggle = vi.fn()
            const event = click(build(onSeriesToggle), { series: a })
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(onSeriesToggle).not.toHaveBeenCalled()
        })
    })

    describe("survival charts", () => {

        function build(values: string[], isSurvival: boolean) {
            return buildChartOptions({
                type: "line",
                data: {
                    column    : "gender",
                    filters   : [],
                    totalCount: 30,
                    rowCount  : values.length,
                    data      : [{ rows: values.map(v => [v, 10] as [string, number]) }]
                },
                data2 : null,
                column: { name: "gender", label: "Gender", dataType: "string", description: "" },
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival
            })
        }

        it ("warns if the X column does not look like a duration", () => {
            expect(build(["female", "male"], true).caption?.text).toContain(
                '<b>Gender</b> does not look like a duration (found "female", "male"), so this will not be a proper survival chart'
            )
        })

        it ("does not warn for durations", () => {
            const flat = (rows: [string, number][]) => ({ column: "t", filters: [], totalCount: 0, rowCount: rows.length, data: [{ rows }] }) as any
            expect(buildChartOptions({
                type: "line",
                data: flat([["0", 10], ["1", 10], ["2", 10], [">=5", 10]]),
                data2 : null,
                column: { name: "t", label: "T", dataType: "string", description: "" },
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true,
                survivalData: { events: flat([["0", 5]]), censored: flat([[">=5", 35]]) }
            }).caption?.text).toBe("")
        })

        it ("asks for a status column until survival data is available", () => {
            expect(build(["0", "1"], true).caption?.text).toContain(
                "Select a Status Column and an Event Value to compute the survival curve"
            )
        })

        it ("does not warn for non-survival charts", () => {
            expect(build(["female", "male"], false).caption?.text).toBe("")
        })

        it ("sorts X by duration, left to right, and ignores sortBy, limit and offset", () => {
            const options = buildChartOptions({
                type: "line",
                data: {
                    column    : "t",
                    filters   : [],
                    totalCount: 15,
                    rowCount  : 5,
                    data      : [{ rows: [["10", 1], [">=5", 2], ["2", 3], ["<1", 4], ["1", 5]] }]
                },
                data2 : null,
                column: { name: "t", label: "T", dataType: "string", description: "" },
                sortBy: "y:desc",
                limit : 2,
                offset: 1,
                isSurvival: true
            })
            expect((options.series![0] as any).data.map((p: any) => p.name)).toEqual(["<1", "1", "2", ">=5", "10"])
            expect((options.xAxis as any).reversed).toBe(false)
        })

        it ("ignores secondary data", () => {
            const options = buildChartOptions({
                type: "line",
                data: {
                    column    : "t",
                    filters   : [],
                    totalCount: 20,
                    rowCount  : 2,
                    data      : [{ rows: [["0", 10], ["1", 10]] }]
                },
                data2: {
                    column    : "t",
                    stratifier: "g",
                    filters   : [],
                    totalCount: 20,
                    rowCount  : 2,
                    counts    : { "0": 10, "1": 10 },
                    data      : [{ stratifier: "a", rows: [["0", 10], ["1", 10]] }]
                },
                column: { name: "t", label: "T", dataType: "string", description: "" },
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true
            })
            expect(options.series!.map(s => s.id)).toEqual(["primary-T"])
        })

        it ("lists at most 3 examples", () => {
            expect(build(["a", "b", "c", "d"], true).caption?.text).toContain('(found "a", "b", "c", ...)')
        })
    })

    describe("survival curve", () => {

        const T = { name: "t", label: "T", dataType: "string", description: "" } as const

        function flat(rows: [string, number][]) {
            return { column: "t", filters: [], totalCount: 0, rowCount: rows.length, data: [{ rows }] } as any
        }

        // Pass typed = true to return stratifier values as JSON types, e.g. 1 or true
        function stratified(groups: Record<string, [string, number][]>, typed = false) {
            const counts: Record<string, number> = {}
            Object.values(groups).forEach(rows => rows.forEach(([x, y]) => counts[x] = (counts[x] || 0) + y))
            return {
                column: "t", stratifier: "g", filters: [], totalCount: 0, rowCount: 1, counts,
                data: Object.entries(groups).map(([stratifier, rows]) => ({
                    stratifier: typed ? JSON.parse(stratifier) : stratifier,
                    rows
                }))
            } as any
        }

        it ("plots the survival at the start of each time point, in %", () => {
            const options = buildChartOptions({
                type: "line",
                // The primary data provides the time points; its counts are not used
                data: flat([["0", 1], ["1", 1], ["2", 1], [">=5", 1]]),
                data2 : null,
                column: T,
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true,
                survivalData: {
                    events  : flat([["0", 10], ["1", 18]]),
                    censored: flat([[">=5", 72]])
                }
            })
            const data = (options.series![0] as any).data
            // 10 of 100 have the event at "0", then 18 of the remaining 90 at "1"
            expect(data.map((p: any) => roundToPrecision(p.y, 6))).toEqual([100, 90, 72, 72])
            expect(data[1].custom.survival).toMatchObject({ x: "1", atRisk: 90, events: 18, censored: 0, survival: 0.9 })
            expect((options.yAxis as any).labels.format).toBe("{text}%")
            expect((options.yAxis as any).softMin).toBe(0)
            expect((options.yAxis as any).softMax).toBe(100)
        })

        it ("computes every series separately", () => {
            const options = buildChartOptions({
                type: "line",
                data: stratified({ a: [["0", 1], ["1", 1]], b: [["0", 1], ["1", 1]] }),
                data2 : null,
                column: T,
                groupBy: { name: "g", label: "G", dataType: "string", description: "" },
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true,
                survivalData: {
                    events  : stratified({ a: [["0", 50]], b: [["0", 10]] }),
                    censored: stratified({ a: [["1", 50]], b: [["1", 90]] })
                }
            })
            expect(options.series!.map(s => s.id)).toEqual(["primary-a", "primary-b"])
            expect(options.series!.map((s: any) => s.data.map((p: any) => p.y))).toEqual([[100, 50], [100, 90]])
        })

        it ("warns if no records have the event value", () => {
            const options = buildChartOptions({
                type: "line",
                data: flat([["0", 1], ["1", 1]]),
                data2 : null,
                column: T,
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true,
                survivalData: {
                    events  : flat([]),
                    censored: flat([["1", 100]]),
                    status  : { label: "EFS Status", eventValue: "Event" }
                }
            })
            expect(options.caption?.text).toContain(
                "No records have <b>EFS Status</b> equal to <b>Event</b>, so the survival curves cannot drop"
            )
            expect((options.series![0] as any).data.map((p: any) => p.y)).toEqual([100, 100])
        })

        it ("supports non-string stratifier values, as returned by the aggregator", () => {
            const options = buildChartOptions({
                type: "line",
                data: stratified({ 1: [["0", 1], ["1", 1]], true: [["0", 1], ["1", 1]] }, true),
                data2 : null,
                column: T,
                groupBy: { name: "g", label: "G", dataType: "integer", description: "" },
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true,
                survivalData: {
                    events  : stratified({ 1: [["0", 50]], true: [["0", 10]] }, true),
                    censored: stratified({ 1: [["1", 50]], true: [["1", 90]] }, true)
                }
            })
            expect(options.series!.map(s => s.name)).toEqual(["1", "true"])
            expect(options.series!.map((s: any) => s.data.map((p: any) => p.y))).toEqual([[100, 50], [100, 90]])
        })

        describe("axis titles", () => {

            function build(options: any, column: Parameters<typeof buildChartOptions>[0]["column"] = T) {
                return buildChartOptions({
                    type: "line",
                    options,
                    data: flat([["0", 1], ["1", 1]]),
                    data2 : null,
                    column,
                    sortBy: "x:asc",
                    limit : 0,
                    offset: 0,
                    isSurvival: true,
                    survivalData: { events: flat([["0", 25]]), censored: flat([["1", 75]]) }
                }) as any
            }

            const YEARS = { name: "event_free_survival_years", label: "", dataType: "string", description: "" } as const
            const AGE   = { name: "age", label: "", dataType: "integer", description: "" } as const

            it ("default to Survival and a title inferred from the X column", () => {
                const options = build({}, YEARS)
                expect(options.yAxis.title.text).toBe("Survival")
                expect(options.xAxis.title.text).toBe("Time (years)")
            })

            it ("keep titles set by the user", () => {
                const options = build({ xAxis: { title: { text: "Years" } }, yAxis: { title: { text: "Event-free" } } }, YEARS)
                expect(options.yAxis.title.text).toBe("Event-free")
                expect(options.xAxis.title.text).toBe("Years")
            })

            it ("update a default X title when the X column changes", () => {
                expect(build(build({}, YEARS), AGE).xAxis.title.text).toBe("Age")
            })

            it ("are removed when switching to another chart type, unless set by the user", () => {
                const defaults = removeSurvivalTitles(build({}, YEARS)) as any
                expect(defaults.xAxis.title.text).toBe("")
                expect(defaults.yAxis.title.text).toBe("")

                const custom = removeSurvivalTitles(build({ xAxis: { title: { text: "Years" } }, yAxis: { title: { text: "Event-free" } } }, YEARS)) as any
                expect(custom.xAxis.title.text).toBe("Years")
                expect(custom.yAxis.title.text).toBe("Event-free")
            })
        })

        describe("confidence bands", () => {

            function build(survivalBands?: boolean, options?: any) {
                return buildChartOptions({
                    type: "line",
                    options,
                    data: stratified({ a: [["0", 1], ["1", 1], ["2", 1]], b: [["0", 1], ["1", 1], ["2", 1]] }),
                    data2 : null,
                    column: T,
                    groupBy: { name: "g", label: "G", dataType: "string", description: "" },
                    sortBy: "x:asc",
                    limit : 0,
                    offset: 0,
                    isSurvival: true,
                    survivalData: {
                        events  : stratified({ a: [["0", 10]], b: [["0", 20]] }),
                        censored: stratified({ a: [["1", 90]], b: [["1", 80]] })
                    },
                    survivalBands
                }) as any
            }

            it ("are not shown by default", () => {
                expect(build().series.map((s: any) => s.type)).toEqual(["line", "line"])
            })

            it ("add one band per curve, linked to it and in its color", () => {
                const series = build(true).series
                expect(series.map((s: any) => s.id)).toEqual(["primary-a", "primary-b", "primary-a (95% CI)", "primary-b (95% CI)"])
                expect(series[2]).toMatchObject({ type: "arearange", linkedTo: "primary-a", color: series[0].color, step: "left" })
                expect(series[3]).toMatchObject({ type: "arearange", linkedTo: "primary-b", color: series[1].color, step: "left" })
            })

            it ("keep the line width, fill opacity and name saved for them", () => {
                const [, , band] = build(true).series
                expect(band).toMatchObject({ lineWidth: 0.2, fillOpacity: 0.15, name: "a (95% CI)" })

                const [, , saved] = build(true, {
                    series: [{ id: "primary-a (95% CI)", type: "arearange", lineWidth: 2, fillOpacity: 0.4, name: "A CI", step: "center" }]
                }).series
                expect(saved).toMatchObject({ lineWidth: 2, fillOpacity: 0.4, name: "A CI", step: "left" })
            })

            it ("show survival and its interval as whole percentages in the tooltip", () => {
                const point = {
                    y     : 72.44,
                    name  : "1",
                    color : "#000000",
                    series: { name: "a", index: 0 },
                    custom: { survival: { atRisk: 90, events: 9, censored: 3, ciLow: 0.583, ciHigh: 0.839 } }
                }
                const html = (build(true).tooltip.formatter as any).call(point, { chart: { options: { colors: [] } } })
                expect(html).toContain("<b>72%</b>")
                expect(html).toContain("<b>58% – 84%</b>")
            })

            it ("show the group size of each curve in the legend", () => {
                const options = build()
                const label = (series: any) => (options.legend.labelFormatter as any).call({ name: series.name, options: series })
                expect(options.series.map(label)).toEqual(["a (n=100)", "b (n=100)"])

                // Other series and pie slices keep their name
                expect(label({ name: "x", data: [{ y: 1 }] })).toBe("x")
                expect((options.legend.labelFormatter as any).call({ name: "slice" })).toBe("slice")
            })

            it ("do not change the colors of the curves", () => {
                expect(build(true).series.slice(0, 2).map((s: any) => s.color)).toEqual(build().series.map((s: any) => s.color))
            })

            it ("follow the confidence interval of each time point, in %", () => {
                const [curve, , band] = build(true).series
                expect(band.data.map((p: any) => p && [p.name, p.low, p.high])).toEqual(curve.data.map((p: any) =>
                    // No band where nobody is left under follow-up
                    p.custom.survival.ciLow === null ? null : [
                        p.name,
                        p.custom.survival.ciLow  * 100,
                        p.custom.survival.ciHigh * 100
                    ]
                ))
                // The curve ends at "2", right after its last records
                expect(band.data[2]).not.toBeNull()
                // Zero width at the start
                expect([band.data[0].low, band.data[0].high]).toEqual([100, 100])
                // Wider after the first events
                expect(band.data[1].low).toBeLessThan(curve.data[1].y)
                expect(band.data[1].high).toBeGreaterThan(curve.data[1].y)
            })
        })

        it ("always draws curves with left steps and marks the chart as a survival chart", () => {
            const build = (isSurvival: boolean) => buildChartOptions({
                type: "line",
                options: { series: [{ id: "primary-T", type: "line", step: "center" }] } as any,
                data: flat([["0", 1], ["1", 1]]),
                data2 : null,
                column: T,
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival,
                survivalData: { events: flat([["0", 25]]), censored: flat([["1", 75]]) }
            }) as any
            expect(build(true).series[0].step).toBe("left")
            expect(build(true).custom.isSurvival).toBe(true)
            expect(build(false).series[0].step).toBe("center")
            expect(build(false).custom.isSurvival).toBe(false)
        })

        it ("ignores a saved denominator", () => {
            const options = buildChartOptions({
                type: "line",
                data: flat([["0", 1], ["1", 1]]),
                data2 : null,
                column: T,
                denominator: "global",
                sortBy: "x:asc",
                limit : 0,
                offset: 0,
                isSurvival: true,
                survivalData: { events: flat([["0", 25]]), censored: flat([["1", 75]]) }
            })
            expect((options.series![0] as any).data.map((p: any) => p.y)).toEqual([100, 75])
        })
    })
})
