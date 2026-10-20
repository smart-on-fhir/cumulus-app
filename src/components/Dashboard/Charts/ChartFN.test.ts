import { removeStaleShadows } from "./ChartFN"

describe("removeStaleShadows", () => {

    it ("removes the line shadow of series that have it turned off", () => {
        const off  = { options: { shadow: false }, graph: { shadow: vi.fn() } }
        const on   = { options: { shadow: { opacity: 0.4 } }, graph: { shadow: vi.fn() } }
        const none = { options: {}, graph: undefined }
        removeStaleShadows({ series: [off, on, none] } as any)
        expect(off.graph.shadow).toHaveBeenCalledWith(false)
        expect(on.graph.shadow).not.toHaveBeenCalled()
    })
})
