import moment from "moment";
import PowerSet from "../../../PowerSet";
import {
    getChartTitleText,
    getDateFormat,
    getSeries,
    getXType,
    // buildChartOptions
} from "./Chart"

function expectInclude(src: any, needle: any) {
    if (needle && typeof needle === "object") {
        expect(src && typeof src === "object").toEqual(true)

        if (Array.isArray(needle)) {
            expect(Array.isArray(src)).toEqual(true)
            
            needle.forEach((v, i) => {
                expectInclude(src[i], v)
            })
        } else {
            for (const key in needle) {
                expectInclude(src[key], needle[key])
            }
        }
    }
    else {
        expect(src).toEqual(needle)
    }
}

describe("Chart", () => {
    
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

    describe("getSeries", () => {
        it ("X is integer, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "integer", label: "", description: "" },
                    { name: "cnt", dataType: "integer", label: "", description: "" }
                ],
                rows: [
                    [ 1, 6 ],
                    [ 2, 5 ],
                    [ 3, 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 6, name: "1", x: 1 },
                    { y: 5, name: "2", x: 2 },
                    { y: 7, name: "3", x: 3 },
                ]
            }])
        })

        it ("X is float, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "float"  , label: "", description: "" },
                    { name: "cnt", dataType: "integer", label: "", description: "" }
                ],
                rows: [
                    [ 2.2, 5 ],
                    [ 1.3, 6 ],
                    [ 3.4, 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 5, name: "2.2", x: 2.2 },
                    { y: 6, name: "1.3", x: 1.3 },
                    { y: 7, name: "3.4", x: 3.4 },
                ]
            }])
        })

        it ("X is boolean, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "boolean", label: "", description: "" },
                    { name: "cnt", dataType: "integer", label: "", description: "" }
                ],
                rows: [
                    [ true , 5 ],
                    [ false, 6 ],
                    [ true , 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 5, name: "true"  },
                    { y: 6, name: "false" },
                    { y: 7, name: "true"  },
                ]
            }])
        })

        it ("X is string, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "string" , label: "", description: "" },
                    { name: "cnt", dataType: "integer", label: "", description: "" }
                ],
                rows: [
                    [ "a", 5 ],
                    [ "b", 6 ],
                    [ "c", 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 5, name: "a" },
                    { y: 6, name: "b" },
                    { y: 7, name: "c" },
                ]
            }])
        })

        it ("X is date:YYYY-MM-DD, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "date:YYYY-MM-DD", label: "", description: "" },
                    { name: "cnt", dataType: "integer"        , label: "", description: "" }
                ],
                rows: [
                    [ "2000-02-03", 5 ],
                    [ "2001-04-05", 6 ],
                    [ "2002-06-07", 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 5, name: "2000-02-03", x: +moment("2000-02-03", "YYYY-MM-DD") },
                    { y: 6, name: "2001-04-05", x: +moment("2001-04-05", "YYYY-MM-DD") },
                    { y: 7, name: "2002-06-07", x: +moment("2002-06-07", "YYYY-MM-DD") },
                ]
            }])
        })

        it ("X is date:YYYY-MM, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "date:YYYY-MM", label: "", description: "" },
                    { name: "cnt", dataType: "integer"     , label: "", description: "" }
                ],
                rows: [
                    [ "2000-02-03", 5 ],
                    [ "2001-04-05", 6 ],
                    [ "2002-06-07", 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 5, name: "2000-02", x: +moment("2000-02-03", "YYYY-MM-DD") },
                    { y: 6, name: "2001-04", x: +moment("2001-04-05", "YYYY-MM-DD") },
                    { y: 7, name: "2002-06", x: +moment("2002-06-07", "YYYY-MM-DD") },
                ]
            }])
        })

        it ("X is date:YYYY, group is undefined", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "x"  , dataType: "date:YYYY", label: "", description: "" },
                    { name: "cnt", dataType: "integer"  , label: "", description: "" }
                ],
                rows: [
                    [ "2000-02-03", 5 ],
                    [ "2001-04-05", 6 ],
                    [ "2002-06-07", 7 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], dataSet, type: "pie", fullDataSet: dataSet });

            expectInclude(series, [{
                type: "pie",
                name: "x",
                data: [
                    { y: 5, name: "2000", x: +moment("2000-02-03", "YYYY-MM-DD") },
                    { y: 6, name: "2001", x: +moment("2001-04-05", "YYYY-MM-DD") },
                    { y: 7, name: "2002", x: +moment("2002-06-07", "YYYY-MM-DD") },
                ]
            }])
        })

        it ("X is date:YYYY-MM, group is string", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "a"  , dataType: "date:YYYY-MM", label: "", description: "" },
                    { name: "b"  , dataType: "string"      , label: "", description: "" },
                    { name: "cnt", dataType: "integer"     , label: "", description: "" }
                ],
                rows: [
                    [ "2000-02-03", "a", 5 ],
                    [ "2000-02-04", "a", 8 ],
                    [ "2001-04-05", "b", 6 ],
                    [ "2001-04-06", "b", 9 ],
                    [ "2002-06-07", "c", 7 ],
                    [ "2002-06-08", "c", 4 ]
                ]
            });

            const series = getSeries({ column: dataSet.cols[0], groupBy: dataSet.cols[1], dataSet, type: "spline", fullDataSet: dataSet });

            expectInclude(series, [
                {
                    type: "spline",
                    name: "a",
                    colorIndex: 0,
                    data: [
                        { y: 5, name: "2000-02", x: +moment("2000-02-03", "YYYY-MM-DD") },
                        { y: 8, name: "2000-02", x: +moment("2000-02-04", "YYYY-MM-DD") },
                    ]
                },
                {
                    type: "spline",
                    name: "b",
                    colorIndex: 1,
                    data: [
                        { y: 6, name: "2001-04", x: +moment("2001-04-05", "YYYY-MM-DD") },
                        { y: 9, name: "2001-04", x: +moment("2001-04-06", "YYYY-MM-DD") },
                    ]
                },
                {
                    type: "spline",
                    name: "c",
                    colorIndex: 2,
                    data: [
                        { y: 7, name: "2002-06", x: +moment("2002-06-07", "YYYY-MM-DD") },
                        { y: 4, name: "2002-06", x: +moment("2002-06-08", "YYYY-MM-DD") },
                    ]
                }
            ])
        })

        it ("X is string, group is date:YYYY-MM", () => {
            const dataSet = PowerSet.from<any>({
                cols: [
                    { name: "a"  , dataType: "string"      , label: "", description: "" },
                    { name: "b"  , dataType: "date:YYYY-MM", label: "", description: "" },
                    { name: "cnt", dataType: "integer"     , label: "", description: "" }
                ],
                rows: [
                    [ "a", "2000-02-03", 5 ],
                    [ "b", "2000-02-03", 8 ],
                    [ "c", "2000-02-03", 6 ],
                    [ "d", "2001-04-06", 9 ],
                    [ "e", "2001-04-06", 7 ],
                    [ "f", "2001-04-06", 4 ]
                ]
            });

            const series = getSeries({
                column : dataSet.cols[0],
                groupBy: dataSet.cols[1],
                dataSet,
                type: "spline",
                fullDataSet: dataSet
            });

            expectInclude(series, [
                {
                    type: "spline",
                    name: "2000-02",
                    colorIndex: 0,
                    fillColor: undefined,
                    data: [
                        { y: 5   , name: "a" },
                        { y: 8   , name: "b" },
                        { y: 6   , name: "c" },
                        { y: null, name: "d" },
                        { y: null, name: "e" },
                        { y: null, name: "f" },
                    ]
                },
                {
                    type: "spline",
                    name: "2001-04",
                    colorIndex: 1,
                    fillColor: undefined,
                    data: [
                        { y: null, name: "a" },
                        { y: null, name: "b" },
                        { y: null, name: "c" },
                        { y: 9   , name: "d" },
                        { y: 7   , name: "e" },
                        { y: 4   , name: "f" },
                    ]
                }
            ])

            // expect(series). toEqual([
            //     {
            //         type: "spline",
            //         name: "2000-02",
            //         colorIndex: 0,
            //         fillColor: undefined,
            //         data: [
            //             { y: 5   , name: "a" },
            //             { y: 8   , name: "b" },
            //             { y: 6   , name: "c" },
            //             { y: null, name: "d" },
            //             { y: null, name: "e" },
            //             { y: null, name: "f" },
            //         ]
            //     },
            //     {
            //         type: "spline",
            //         name: "2001-04",
            //         colorIndex: 1,
            //         fillColor: undefined,
            //         data: [
            //             { y: null, name: "a" },
            //             { y: null, name: "b" },
            //             { y: null, name: "c" },
            //             { y: 9   , name: "d" },
            //             { y: 7   , name: "e" },
            //             { y: 4   , name: "f" },
            //         ]
            //     }
            // ])
        })
    })

    // describe("buildChartOptions", () => {
    //     it ("tooltip options for chart with one dimension", () => {
    //         const dataSet = PowerSet.from<any>({
    //             cols: [
    //                 { name: "x"  , dataType: "integer", label: "", description: "" },
    //                 { name: "cnt", dataType: "integer", label: "", description: "" }
    //             ],
    //             rows: [
    //                 [ 2, 5 ],
    //                 [ 1, 6 ],
    //                 [ 3, 7 ]
    //             ]
    //         });

    //         const options = buildChartOptions({ column: dataSet.cols[0], dataSet, type: "column" });

    //         expect(options.tooltip?.pointFormat?.split("\n")).toEqual([
    //             '<tr><td style="text-align:right">x:</td><td><b>{point.name}</b></td></tr>',
    //             '<tr><td style="text-align:right">Count:</td><td><b>{point.y}</b></td></tr>'
    //         ])
    //     })

    //     it ("tooltip options for chart with two dimensions", () => {
    //         const dataSet = PowerSet.from<any>({
    //             cols: [
    //                 { name: "x"  , dataType: "integer", label: "", description: "" },
    //                 { name: "y"  , dataType: "integer", label: "", description: "" },
    //                 { name: "cnt", dataType: "integer", label: "", description: "" }
    //             ],
    //             rows: [
    //                 [ 2, 3, 5 ],
    //                 [ 1, 4, 6 ],
    //                 [ 3, 5, 7 ]
    //             ]
    //         });

    //         const options = buildChartOptions({ column: dataSet.cols[0], groupBy: dataSet.cols[1], dataSet, type: "column" });

    //         expect(options.tooltip?.pointFormat?.split("\n")).toEqual([
    //             '<tr><td style="text-align:right">x:</td><td><b>{point.name}</b></td></tr>',
    //             '<tr><td style="text-align:right">y:</td><td><b>{series.name}</b></td></tr>',
    //             '<tr><td style="text-align:right">Count:</td><td><b>{point.y}</b></td></tr>'
    //         ])
    //     })
    // })
})
