import {
    emToPx,
    filterOutExceptions,
    getChartTitleText,
    getDateFormat,
    getXType,
    pct,
} from "./lib"
import { DEFAULT_FONT_SIZE } from "../config"


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
            ["cumulus__none", 2],
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
            ["cumulus__none", 2],
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

})
