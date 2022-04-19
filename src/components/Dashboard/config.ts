import moment from "moment";


export const SupportedChartTypes = {
    pie          : "Pie Chart",
    pie3d        : "Pie Chart 3D",
    donut        : "Donut Chart",
    donut3d      : "Donut Chart 3D",
    
    spline       : "Line Chart",
    areaspline   : "Area Chart",

    column       : "Column Chart",
    column3d     : "Column Chart 3D",
    columnStack  : "Stacked Column Chart",
    columnStack3d: "Stacked Column Chart 3D",
    
    bar          : "Bar Chart",
    bar3d        : "Bar Chart 3D",
    barStack     : "Stacked Bar Chart",
    barStack3d   : "Stacked Bar Chart 3D",
}

export const ChartIcons = {
    pie          : "/icons/pie_chart.png",
    pie3d        : "/icons/pie_chart.png",
    donut        : "/icons/donut_chart.png",
    donut3d      : "/icons/donut_chart.png",
    
    spline       : "/icons/line_chart.png",
    areaspline   : "/icons/area_chart.png", //"fas fa-chart-area",

    column       : "/icons/column_chart.png",
    column3d     : "/icons/column_chart.png",
    columnStack  : "/icons/column_chart_stacked.png",
    columnStack3d: "/icons/column_chart_stacked.png",
    
    bar          : "/icons/bar_chart.png",
    bar3d        : "/icons/bar_chart.png",
    barStack     : "/icons/bar_chart.png",
    barStack3d   : "/icons/bar_chart.png",
}

export type SupportedNativeChartTypes = "pie" | "spline" | "areaspline" | "column" | "bar" | "area"

/**
 * Charts that can only have one dimension plus count. They DO NOT support
 * grouping!
 */
export const SingleDimensionChartTypes: (keyof typeof SupportedChartTypes)[] = ["pie", "pie3d", "donut", "donut3d"]

export const ReadOnlyPaths = [
    "chart.marginTop",
    "chart.type",
    "series",
    "chart.options3d.depth",
    "chart.plotBorderWidth",
    "colors",
    "yAxis.allowDecimals",
    "yAxis.labels.format",
    "plotOptions.pie.dataLabels.formatter",
    "tooltip.formatter",
    "xAxis.type",
];

// export const CHART_COLORS = [
//     "#f63", "#ea5", "#dd0", "#ae0", "#5d0", "#2ee", "#8af", "#96f", "#c6f",
//     "#f6f", "#c44", "#cb4", "#9b0", "#3a0", "#3ab", "#2bb", "#658", "#65d",
//     "#b5e", "#c4c", "#d88", "#cc3", "#9a0", "#6b0", "#3b6", "#3d9", "#476",
//     "#779", "#b7a", "#c69", '#a66', '#796', '#669', '#C66', '#6C6', '#66C',
//     '#F66', '#6F6', '#63F', '#933', '#396', '#339'

//     // "#036", "#147", "#258", "#369", "#47A", "#58B", "#69C", "#7AD", "#8BE", "#9CF"
//     // "#04d", "#09c", "#0c9", "#99c", "#c99", "#f96", "#c63", "#f66", "#F90", "#cc0", "#9c0", "#099"
// ];



type ColData = string|number|boolean|null

interface FilterConfig {
    id: string
    label: string
    type: string[]
    fn: (left: ColData, right: ColData) => boolean
    defaultValue?: ColData
}

export const operators: FilterConfig[] = [
    { id: "eq" , label: "==", type: ["integer", "float" ], defaultValue: undefined, fn: (l, r) => typeof l === "number" && typeof r === "number" && l === r },
    { id: "gt" , label: ">" , type: ["integer", "float" ], defaultValue: undefined, fn: (l, r) => typeof l === "number" && typeof r === "number" && l >   r },
    { id: "gte", label: ">=", type: ["integer", "float" ], defaultValue: undefined, fn: (l, r) => typeof l === "number" && typeof r === "number" && l >=  r },
    { id: "lt" , label: "<" , type: ["integer", "float" ], defaultValue: undefined, fn: (l, r) => typeof l === "number" && typeof r === "number" && l <   r },
    { id: "lte", label: "<=", type: ["integer", "float" ], defaultValue: undefined, fn: (l, r) => typeof l === "number" && typeof r === "number" && l <=  r },

    { id: "strEq"          , label: "Equal"                             , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l === r                                                             },
    { id: "strContains"    , label: "Contain"                           , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.search(r) > -1                                                    },
    { id: "strStartsWith"  , label: "Start with"                        , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.startsWith(r)                                                     },
    { id: "strEndsWith"    , label: "End with"                          , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.endsWith(r)                                                       },
    { id: "matches"        , label: "Matches RegExp"                    , type: ["string"], defaultValue: undefined, fn: (l, r) => { try { return typeof l === "string" && typeof r === "string" && new RegExp(r).test(l) } catch { return false }}      },
    { id: "strEqCI"        , label: "Equal (case insensitive)"          , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.toLowerCase() === r.toLowerCase()                                 },
    { id: "strContainsCI"  , label: "Contain (case insensitive)"        , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.toLowerCase().search(r.toLowerCase()) > -1                        },
    { id: "strStartsWithCI", label: "Start with (case insensitive)"     , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.toLowerCase().startsWith(r.toLowerCase())                         },
    { id: "strEndsWithCI"  , label: "End with (case insensitive)"       , type: ["string"], defaultValue: undefined, fn: (l, r) => typeof l === "string" && typeof r === "string" && l.toLowerCase().endsWith(r.toLowerCase())                           },
    { id: "matchesCI"      , label: "Matches RegExp  (case insensitive)", type: ["string"], defaultValue: undefined, fn: (l, r) => { try { return typeof l === "string" && typeof r === "string" && new RegExp(r, "i").test(l) } catch { return false }} },
    
    { id: "sameDay"          , label: "Same date"           , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSame        (moment(r).utc(), "day"  ) },
    { id: "sameMonth"        , label: "Same month"          , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSame        (moment(r).utc(), "month") },
    { id: "sameYear"         , label: "Same year"           , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSame        (moment(r).utc(), "year" ) },
    { id: "sameDayOrBefore"  , label: "Same date or before" , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrBefore(moment(r).utc(), "day"  ) },
    { id: "sameDayOrAfter"   , label: "Same date or after"  , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrAfter (moment(r).utc(), "day"  ) },
    { id: "sameMonthOrBefore", label: "Same month or before", type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrBefore(moment(r).utc(), "month") },
    { id: "sameMonthOrAfter" , label: "Same month or after" , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrAfter (moment(r).utc(), "month") },
    { id: "sameYearOrBefore" , label: "Same year or before" , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrBefore(moment(r).utc(), "year" ) },
    { id: "sameYearOrAfter"  , label: "Same year or after"  , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isSameOrAfter (moment(r).utc(), "year" ) },
    { id: "beforeDay"        , label: "Before date"         , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isBefore      (moment(r).utc(), "day"  ) },
    { id: "afterDay"         , label: "After date"          , type: [ "date:YYYY-MM-DD" ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isAfter       (moment(r).utc(), "day"  ) },
    { id: "beforeMonth"      , label: "Before month"        , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isBefore      (moment(r).utc(), "month") },
    { id: "afterMonth"       , label: "After month"         , type: [ "date:YYYY-MM"    ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isAfter       (moment(r).utc(), "month") },
    { id: "beforeYear"       , label: "Before year"         , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isBefore      (moment(r).utc(), "year" ) },
    { id: "afterYear"        , label: "After year"          , type: [ "date:YYYY"       ], defaultValue: undefined, fn: (l, r) => l !== null && typeof l === "string" && typeof r === "number" && moment(l, "YYYY-MM-DD").utc().isAfter       (moment(r).utc(), "year" ) },
    
    { id: "isTrue" , label: "IS TRUE" , type: ["boolean"], defaultValue: true , fn: (l, r) => l === true  },
    { id: "isFalse", label: "IS FALSE", type: ["boolean"], defaultValue: false, fn: (l, r) => l === false },
    
    { id: "isNull", label: "IS NULL", type: ["*"], defaultValue: null , fn: (l, r) => l === null  },
];
