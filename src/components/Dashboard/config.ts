import moment from "moment";

export const SupportedChartTypes = {
    pie         : "Pie Chart",
    pie3d       : "Pie Chart 3D",
    donut       : "Donut Chart",
    donut3d     : "Donut Chart 3D",
    
    spline      : "Line Chart",
    areaspline  : "Area Chart",
    
    column      : "Column Chart",
    column3d    : "Column Chart 3D",
    
    bar         : "Bar Chart",
    bar3d       : "Bar Chart 3D"
}

/**
 * Charts that can only have one dimension plus count. They DO NOT support
 * grouping!
 */
export const SimpleCharts = [ "pie", "pie3d", "donut", "donut3d" ]

type ColData = string|number|boolean|null


export const operators = [
    { id: "eq"               , label: "=="                           , type: ["integer", "float" ], fn: (l: ColData, r: ColData) => typeof l === "number" && typeof r === "number" && l === r },
    { id: "gt"               , label: ">"                            , type: ["integer", "float" ], fn: (l: ColData, r: ColData) => typeof l === "number" && typeof r === "number" && l >   r },
    { id: "gte"              , label: ">="                           , type: ["integer", "float" ], fn: (l: ColData, r: ColData) => typeof l === "number" && typeof r === "number" && l >=  r },
    { id: "lt"               , label: "<"                            , type: ["integer", "float" ], fn: (l: ColData, r: ColData) => typeof l === "number" && typeof r === "number" && l <   r },
    { id: "lte"              , label: "<="                           , type: ["integer", "float" ], fn: (l: ColData, r: ColData) => typeof l === "number" && typeof r === "number" && l <=  r },

    { id: "strEq"            , label: "Equal"                        , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l === r                                      },
    { id: "strContains"      , label: "Contain"                      , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.search(r) > -1                             },
    { id: "strStartsWith"    , label: "Start with"                   , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.startsWith(r)                              },
    { id: "strEndsWith"      , label: "End with"                     , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.endsWith(r)                                },
    { id: "strEqCI"          , label: "Equal (case insensitive)"     , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.toLowerCase() === r.toLowerCase()          },
    { id: "strContainsCI"    , label: "Contain (case insensitive)"   , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.toLowerCase().search(r.toLowerCase()) > -1 },
    { id: "strStartsWithCI"  , label: "Start with (case insensitive)", type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.toLowerCase().startsWith(r.toLowerCase())  },
    { id: "strEndsWithCI"    , label: "End with (case insensitive)"  , type: ["string"           ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && l.toLowerCase().endsWith(r.toLowerCase())    },
    
    { id: "isTrue"           , label: "IS TRUE"                      , type: ["boolean"          ], fn: (l: any, r?: any) => l === true  },
    { id: "isFalse"          , label: "IS FALSE"                     , type: ["boolean"          ], fn: (l: any, r?: any) => l === false },
    
    { id: "isNull"           , label: "IS NULL"                      , type: ["*"                ], fn: (l: any, r?: any) => l === null  },

    { id: "sameDay"          , label: "Same date"                    , type: [ "date:YYYY-MM-DD" ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSame        (moment(r).utc(), "day"  ) },
    { id: "sameMonth"        , label: "Same month"                   , type: [ "date:YYYY-MM"    ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSame        (moment(r).utc(), "month") },
    { id: "sameYear"         , label: "Same year"                    , type: [ "date:YYYY"       ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSame        (moment(r).utc(), "year" ) },
    { id: "sameDayOrBefore"  , label: "Same date or before"          , type: [ "date:YYYY-MM-DD" ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSameOrBefore(moment(r).utc(), "day"  ) },
    { id: "sameDayOrAfter"   , label: "Same date or after"           , type: [ "date:YYYY-MM-DD" ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSameOrAfter (moment(r).utc(), "day"  ) },
    { id: "sameMonthOrBefore", label: "Same month or before"         , type: [ "date:YYYY-MM"    ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSameOrBefore(moment(r).utc(), "month") },
    { id: "sameMonthOrAfter" , label: "Same month or after"          , type: [ "date:YYYY-MM"    ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSameOrAfter (moment(r).utc(), "month") },
    { id: "sameYearOrBefore" , label: "Same year or before"          , type: [ "date:YYYY"       ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSameOrBefore(moment(r).utc(), "year" ) },
    { id: "sameYearOrAfter"  , label: "Same year or after"           , type: [ "date:YYYY"       ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isSameOrAfter (moment(r).utc(), "year" ) },
    { id: "beforeDay"        , label: "Before date"                  , type: [ "date:YYYY-MM-DD" ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isBefore      (moment(r).utc(), "day"  ) },
    { id: "afterDay"         , label: "After date"                   , type: [ "date:YYYY-MM-DD" ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isAfter       (moment(r).utc(), "day"  ) },
    { id: "beforeMonth"      , label: "Before month"                 , type: [ "date:YYYY-MM"    ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isBefore      (moment(r).utc(), "month") },
    { id: "afterMonth"       , label: "After month"                  , type: [ "date:YYYY-MM"    ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isAfter       (moment(r).utc(), "month") },
    { id: "beforeYear"       , label: "Before year"                  , type: [ "date:YYYY"       ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isBefore      (moment(r).utc(), "year" ) },
    { id: "afterYear"        , label: "After year"                   , type: [ "date:YYYY"       ], fn: (l: ColData, r: ColData) => typeof l === "string" && typeof r === "string" && moment(l).utc().isAfter       (moment(r).utc(), "year" ) },
];
