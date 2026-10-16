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
            expect(build(["0", "1", "2", ">=5"], true).caption?.text).toBe("")
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

})
