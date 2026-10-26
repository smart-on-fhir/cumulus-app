import { CopyGraph } from "./CopyGraph"


describe("CopyGraph", () => {

    afterEach(() => {
        vi.useRealTimers()
    })

    // History state is structured-cloned, so functions in the runtime chart
    // options (e.g. Highcharts formatters) must not reach it
    it("passes the runtime view as cloneable history state", () => {
        vi.useFakeTimers()
        const navigate = vi.fn()
        const payload: any = {
            id: 1,
            name: "Graph",
            settings: {
                chartOptions: {
                    legend: { labelFormatter() { return "" } },
                    series: [{ id: "a", events: { click() {} } }]
                }
            }
        }

        new CopyGraph({ id: 1 }, { id: 1 } as any, navigate, payload).execute()
        vi.runAllTimers()

        expect(navigate).toHaveBeenCalledOnce()
        const [path, options] = navigate.mock.calls[0]
        expect(path).toBe("/views/1/copy")
        expect(() => structuredClone(options.state)).not.toThrow()
        expect(options.state.view.settings.chartOptions.series[0].id).toBe("a")
    })
})
