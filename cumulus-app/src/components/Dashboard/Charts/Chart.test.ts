import {
    getChartTitleText,
    getDateFormat,
    getXType,
} from "./Chart"


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

})
