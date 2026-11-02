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
        expect(reducer(state, { type: "NO_SUCH_ACTION" })).toBe(state)
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
            for (const type of ["pie", "pie3d", "donut", "donut3d"]) {
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
