import {
    buildChartOptions,
    emToPx,
    filterOutExceptions,
    getChartTitleText,
    getDateFormat,
    getXType,
    pct,
} from "./lib"
import { CUMULUS__NONE, DEFAULT_FONT_SIZE } from "../config"


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

        const a: any = { userOptions: { id: "a" }, options: {}, visible: true  }
        const b: any = { userOptions: { id: "b" }, options: {}, visible: false }
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

        it ("toggles linked series without a legend item along with their series", () => {
            const s     : any = { userOptions: { id: "s" }, options: {}, visible: true }
            const range : any = { userOptions: { id: "s (range)", linkedTo: "s" }, options: { showInLegend: false }, visible: true }
            const second: any = { userOptions: { id: "s2", linkedTo: "s" }, options: { showInLegend: true }, visible: true }
            s.chart = range.chart = second.chart = { series: [s, range, second] }
            const onSeriesToggle = vi.fn()
            click(build(onSeriesToggle), s)
            expect(onSeriesToggle).toHaveBeenCalledWith({ s: false, "s (range)": false, s2: true })
        })
    })

    describe("confidence intervals", () => {

        function build() {
            return buildChartOptions({
                type: "line",
                data: {
                    column    : "t",
                    stratifier: "g",
                    filters   : [],
                    totalCount: 3,
                    rowCount  : 3,
                    counts    : { "1": 40, "2": 20 },
                    data: [
                        { stratifier: "a", rows: [["1", 10, 8, 12], ["2", 20, 18, 22]] },
                        { stratifier: "b", rows: [["1", 30, 28, 32]] }
                    ]
                } as any,
                data2 : null,
                column: { name: "t", label: "T", dataType: "string", description: "" },
                groupBy: { name: "g", label: "G", dataType: "string", description: "" },
                ranges: { type: "errorbar", enabled: true } as any,
                sortBy: "x:asc",
                limit : 0,
                offset: 0
            })
        }

        it ("have no legend item of their own", () => {
            const ranges = build().series!.filter(s => String(s.id).endsWith(" (range)"))
            expect(ranges.map(s => s.id)).toEqual(["primary-a (range)", "primary-b (range)"])
            ranges.forEach(s => expect(s.showInLegend).toBe(false))
        })

        it ("have gaps where their series has gaps", () => {
            const range: any = build().series!.find(s => s.id === "primary-b (range)")
            expect(range.data[1]).toMatchObject({ y: null, low: null, high: null })
        })
    })
})
