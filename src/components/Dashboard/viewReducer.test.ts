import { getViewReducer, ViewState } from "."
import { SURVIVAL_Y_TITLE }          from "./Charts/lib"
import { SURVIVAL_CAPTION }          from "./Charts/Survival"
import { app }                       from "../../types"


// These tests pin down the current behavior of the Dashboard reducer, so that
// refactoring it can't change that behavior unnoticed.

const reducer = getViewReducer({ onSeriesToggle: () => {}, onInspectionChange: () => {} })

function getState(patch: Partial<ViewState> = {}): ViewState {
    return {
        viewType         : "overview",
        showOptions      : false,
        viewName         : "Test Chart",
        viewDescription  : "",
        viewColumn       : { name: "gender", label: "Gender", description: "", dataType: "string" },
        filters          : [],
        chartType        : "column",
        chartOptions     : { chart: { type: "column" }, title: { text: "Chart Title" } },
        denominator      : "",
        eventValue       : "",
        survivalBands    : false,
        survivalRiskTable: false,
        caption          : "",
        data             : null,
        data2            : null,
        loadingData      : false,
        dataTabIndex     : 0,
        tags             : [],
        ranges           : { enabled: false },
        visualOverrides  : { enabled: false, brightness: 100, contrast: 100, saturation: 100 },
        inspection       : { enabled: false, match: [], context: { selectedAnnotationIndex: -1, selectedPlotLineId: "", selectedPlotLineAxis: "", selectedSeriesId: "" } },
        isDraft          : false,
        sortBy           : "x:asc",
        limit            : 0,
        offset           : 0,
        chartIsRendered  : false,
        pendingSaveProps : null,
        ...patch
    }
}

const ageColumn: app.SubscriptionDataColumn = { name: "age", label: "Age", description: "", dataType: "integer" }

describe("Dashboard reducer without data", () => {

    it ("SET_VIEW_TYPE sets the view type", () => {
        expect(reducer(getState(), { type: "SET_VIEW_TYPE", payload: "data" }).viewType).toBe("data")
    })

    it ("TOGGLE_OPTIONS flips showOptions", () => {
        const state = reducer(getState(), { type: "TOGGLE_OPTIONS" })
        expect(state.showOptions).toBe(true)
        expect(reducer(state, { type: "TOGGLE_OPTIONS" }).showOptions).toBe(false)
    })

    it ("returns the same state for unknown actions", () => {
        const state = getState()
        expect(reducer(state, { type: "NO_SUCH_ACTION" } as any)).toBe(state)
    })

    it ("SET_CHART_OPTIONS is ignored", () => {
        const state = getState()
        expect(reducer(state, { type: "SET_CHART_OPTIONS", payload: { title: { text: "New" } } })).toBe(state)
    })

    it ("SET_RANGE_OPTIONS sets the ranges and leaves the chart options alone", () => {
        const state = getState()
        const next  = reducer(state, { type: "SET_RANGE_OPTIONS", payload: { enabled: true, type: "errorbar" } })
        expect(next.ranges).toEqual({ enabled: true, type: "errorbar" })
        expect(next.chartOptions).toBe(state.chartOptions)
    })

    it ("SET_SECONDARY_DATA_OPTIONS sets the extra column and its type", () => {
        const next = reducer(getState(), { type: "SET_SECONDARY_DATA_OPTIONS", payload: { column: ageColumn, type: "spline" } })
        expect(next.column2).toBe(ageColumn)
        expect(next.column2type).toBe("spline")
    })

    describe("MERGE", () => {

        it ("replaces top-level keys", () => {
            const next = reducer(getState(), { type: "MERGE", payload: { viewName: "New Name", loadingData: true } })
            expect(next.viewName).toBe("New Name")
            expect(next.loadingData).toBe(true)
        })

        it ("replaces nested objects instead of merging them", () => {
            const next = reducer(getState(), { type: "MERGE", payload: { chartOptions: { title: { text: "New" } } } })
            expect(next.chartOptions).toEqual({ title: { text: "New" } })
        })
    })

    describe("UPDATE", () => {

        it ("deep-merges nested objects", () => {
            const next = reducer(getState(), { type: "UPDATE", payload: { chartOptions: { title: { text: "New" } } } })
            expect(next.chartOptions).toEqual({ chart: { type: "column" }, title: { text: "New" } })
        })

        it ("returns a copy, leaving the previous state unchanged", () => {
            const state = getState()
            const next  = reducer(state, { type: "UPDATE", payload: { viewName: "New Name" } })
            expect(next).not.toBe(state)
            expect(next.chartOptions).not.toBe(state.chartOptions)
            expect(state.viewName).toBe("Test Chart")
        })

        it ("opens the options panel when inspection matches something", () => {
            const state = getState()
            const next  = reducer(state, { type: "UPDATE", payload: { inspection: { ...state.inspection, enabled: true, match: ["title"] } } })
            expect(next.showOptions).toBe(true)
        })

        it ("leaves the options panel alone when inspection matches nothing", () => {
            const state = getState()
            const next  = reducer(state, { type: "UPDATE", payload: { inspection: { ...state.inspection, enabled: true, match: [] } } })
            expect(next.showOptions).toBe(false)
        })
    })

    describe("SET_CHART_TYPE", () => {

        it ("sets the chart type", () => {
            expect(reducer(getState(), { type: "SET_CHART_TYPE", payload: "line" }).chartType).toBe("line")
        })

        it ("clears the stratifier and the secondary data for pie and donut charts", () => {
            for (const type of ["pie", "pie3d", "donut", "donut3d"] as const) {
                const next = reducer(getState({ viewGroupBy: ageColumn, data2: {} as any }), { type: "SET_CHART_TYPE", payload: type })
                expect(next.viewGroupBy).toBeUndefined()
                expect(next.data2).toBeNull()
            }
        })

        it ("keeps the stratifier for other charts", () => {
            const next = reducer(getState({ viewGroupBy: ageColumn }), { type: "SET_CHART_TYPE", payload: "line" })
            expect(next.viewGroupBy).toBe(ageColumn)
        })

        it ("adds the survival caption when switching to survival with no caption", () => {
            const next = reducer(getState(), { type: "SET_CHART_TYPE", payload: "survival" })
            expect(next.caption).toBe(SURVIVAL_CAPTION)
        })

        it ("removes the survival caption and y-axis title when leaving survival", () => {
            const state = getState({
                chartType   : "survival",
                caption     : SURVIVAL_CAPTION,
                chartOptions: { chart: { type: "line" }, yAxis: { title: { text: SURVIVAL_Y_TITLE } } }
            })
            const next = reducer(state, { type: "SET_CHART_TYPE", payload: "line" })
            expect(next.caption).toBe("")
            // @ts-ignore yAxis is a single object here
            expect(next.chartOptions.yAxis.title.text).toBe("")
        })

        it ("keeps a custom caption", () => {
            const next = reducer(getState({ caption: "<p>Mine</p>" }), { type: "SET_CHART_TYPE", payload: "survival" })
            expect(next.caption).toBe("<p>Mine</p>")
        })
    })
})

describe("Dashboard reducer with data", () => {

    const genderColumn: app.SubscriptionDataColumn = { name: "gender", label: "Gender", description: "", dataType: "string" }

    function getData(rows: [string, number][]): app.ServerResponses.DataResponse {
        return { column: "gender", filters: [], totalCount: 30, rowCount: rows.length, data: [{ rows }] }
    }

    // A state as it is once the data has loaded and the chart has been built
    function getStateWithData(patch: Partial<ViewState> = {}): ViewState {
        return reducer(
            getState({ viewColumn: genderColumn, ...patch }),
            { type: "UPDATE", payload: { data: getData([["female", 10], ["male", 20]]) } }
        )
    }

    function getPoints(state: ViewState) {
        // @ts-ignore
        return state.chartOptions.series![0].data.map((p: any) => [p.name, p.y])
    }

    it ("loading the data builds the chart", () => {
        const state = getStateWithData()
        expect(state.chartOptions.series![0].id).toBe("primary-Gender")
        expect(getPoints(state)).toEqual([["female", 10], ["male", 20]])
    })

    describe("UPDATE", () => {

        it ("rebuilds the chart when the data changes", () => {
            const next = reducer(getStateWithData(), { type: "UPDATE", payload: { data: getData([["other", 5]]) } })
            expect(getPoints(next)).toEqual([["other", 5]])
        })

        it ("rebuilds the chart when the denominator changes", () => {
            const next = reducer(getStateWithData(), { type: "UPDATE", payload: { denominator: "global" } })
            const [[, female], [, male]] = getPoints(next)
            expect(female).toBeCloseTo(100 / 3)
            expect(male).toBeCloseTo(200 / 3)
        })

        it ("rebuilds the chart when sorting or paging changes", () => {
            const state = getStateWithData()
            expect(getPoints(reducer(state, { type: "UPDATE", payload: { sortBy: "y:desc" } }))).toEqual([["male", 20], ["female", 10]])
            expect(getPoints(reducer(state, { type: "UPDATE", payload: { limit : 1        } }))).toEqual([["female", 10]])
            expect(getPoints(reducer(state, { type: "UPDATE", payload: { offset: 1        } }))).toEqual([["male", 20]])
        })

        it ("rebuilds the chart for object values even if they are equal", () => {
            const state = getStateWithData()
            const next  = reducer(state, { type: "UPDATE", payload: { inspection: { ...state.inspection } } })
            expect(next.chartOptions.series).not.toBe(state.chartOptions.series)
        })

        it ("doesn't rebuild the chart when a value is set to what it already is", () => {
            const state = getStateWithData()
            const next  = reducer(state, { type: "UPDATE", payload: { sortBy: state.sortBy } })
            expect(next.chartOptions.series).toBe(state.chartOptions.series)
        })

        // Highcharts.merge copies arrays by reference, so an unchanged series
        // array means the chart was not rebuilt
        for (const key of ["viewName", "viewColumn", "viewGroupBy", "filters", "column2type", "ranges", "chartOptions"] as const) {
            it (`doesn't rebuild the chart when ${key} changes`, () => {
                const values = {
                    viewName    : "New Name",
                    viewColumn  : ageColumn,
                    viewGroupBy : ageColumn,
                    filters     : [{ left: "gender", operator: "eq", negated: false, right: { type: "value", value: "male" }, join: "and" }],
                    column2type : "line",
                    ranges      : { enabled: true, type: "errorbar" },
                    chartOptions: { title: { text: "New" } }
                }
                const state = getStateWithData()
                const next  = reducer(state, { type: "UPDATE", payload: { [key]: values[key] } })
                expect(next.chartOptions.series).toBe(state.chartOptions.series)
            })
        }

        // SliceEditor changes the series and colors in place, then sends the
        // settings without chartOptions (see ConfigPanel.test.tsx)
        it ("keeps chart options that were changed in place", () => {
            const state = getStateWithData()
            // @ts-ignore
            state.chartOptions.series![0].opacity = 0.5
            state.chartOptions.colors![0] = "#ff0000"
            const next = reducer(state, { type: "UPDATE", payload: { viewName: "New Name" } })
            // @ts-ignore
            expect(next.chartOptions.series![0].opacity).toBe(0.5)
            expect(next.chartOptions.colors![0]).toBe("#ff0000")
        })
    })

    describe("SET_CHART_OPTIONS", () => {

        it ("merges the changes and rebuilds the chart", () => {
            const state = getStateWithData()
            const next  = reducer(state, { type: "SET_CHART_OPTIONS", payload: { title: { text: "New" } } })
            expect(next.chartOptions.title?.text).toBe("New")
            expect(next.chartOptions.series).not.toBe(state.chartOptions.series)
            expect(getPoints(next)).toEqual([["female", 10], ["male", 20]])
        })

        it ("leaves the previous state unchanged", () => {
            const state = getStateWithData()
            reducer(state, { type: "SET_CHART_OPTIONS", payload: { title: { text: "New" } } })
            expect(state.chartOptions.title?.text).toBe("Chart Title")
        })
    })

    describe("SET_CHART_TYPE", () => {

        it ("rebuilds the chart as the new type", () => {
            const next = reducer(getStateWithData(), { type: "SET_CHART_TYPE", payload: "line" })
            expect(next.chartOptions.chart?.type).toBe("line")
            expect((next.chartOptions.series![0] as Highcharts.SeriesOptionsType).type).toBe("line")
        })

        it ("rebuilds pie charts with a pie series", () => {
            const next = reducer(getStateWithData(), { type: "SET_CHART_TYPE", payload: "pie" })
            expect(next.chartOptions.chart?.type).toBe("pie")
            expect((next.chartOptions.series![0] as Highcharts.SeriesOptionsType).type).toBe("pie")
        })
    })

    describe("default chart options", () => {

        // `credits` only appears when getDefaultChartOptions has been applied
        const getBareState = () => ({ ...getStateWithData(), chartOptions: { chart: { type: "column" } } as Partial<Highcharts.Options> })

        it ("UPDATE applies them when it rebuilds", () => {
            const next = reducer(getBareState(), { type: "UPDATE", payload: { denominator: "global" } })
            expect(next.chartOptions.credits).toBeDefined()
        })

        it ("SET_CHART_OPTIONS applies them", () => {
            const next = reducer(getBareState(), { type: "SET_CHART_OPTIONS", payload: { title: { text: "New" } } })
            expect(next.chartOptions.credits).toBeDefined()
        })

        it ("SET_CHART_TYPE applies them", () => {
            const next = reducer(getBareState(), { type: "SET_CHART_TYPE", payload: "line" })
            expect(next.chartOptions.credits).toBeDefined()
        })

        it ("SET_RANGE_OPTIONS rebuilds without them", () => {
            const state = getBareState()
            const next  = reducer(state, { type: "SET_RANGE_OPTIONS", payload: { enabled: true, type: "errorbar" } })
            expect(next.chartOptions.series).toBeDefined()
            expect(next.chartOptions.credits).toBeUndefined()
        })

        it ("SET_SECONDARY_DATA_OPTIONS rebuilds without them", () => {
            const state = getBareState()
            const next  = reducer(state, { type: "SET_SECONDARY_DATA_OPTIONS", payload: { column: ageColumn, type: "line" } })
            expect(next.chartOptions.series).toBeDefined()
            expect(next.chartOptions.credits).toBeUndefined()
        })
    })
})
