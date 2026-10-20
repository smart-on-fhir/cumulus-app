import { fireEvent, render, screen } from "@testing-library/react"
import ShadowEditor, { SHADOW_DEFAULTS } from "./ShadowEditor"

describe("ShadowEditor", () => {

    function setup(props: any) {
        const onChange = vi.fn()
        render(<ShadowEditor props={props} onChange={onChange} open />)
        const [offsetX, offsetY, width, opacity] = screen.getAllByRole("spinbutton")
        return { onChange, offsetX, offsetY, width, opacity }
    }

    it ("saves the shadow it shows when enabled", () => {
        const { onChange } = setup(false)
        fireEvent.click(screen.getByRole("checkbox"))
        expect(onChange).toHaveBeenCalledWith(SHADOW_DEFAULTS)
    })

    it ("saves the whole shadow when one option changes", () => {
        const { onChange, opacity, width } = setup({ opacity: 0.4 })
        fireEvent.change(width, { target: { value: "1" } })
        expect(onChange).toHaveBeenLastCalledWith({ ...SHADOW_DEFAULTS, opacity: 0.4, width: 1 })
        fireEvent.change(opacity, { target: { value: "0.2" } })
        expect(onChange).toHaveBeenLastCalledWith({ ...SHADOW_DEFAULTS, opacity: 0.2 })
    })

    it ("treats true as the default shadow", () => {
        const { onChange, offsetX } = setup(true)
        fireEvent.change(offsetX, { target: { value: "2" } })
        expect(onChange).toHaveBeenLastCalledWith({ ...SHADOW_DEFAULTS, offsetX: 2 })
    })

    it ("puts a cleared option back to its default", () => {
        const { onChange, width } = setup({ ...SHADOW_DEFAULTS, width: 5 })
        fireEvent.change(width, { target: { value: "" } })
        expect(onChange).toHaveBeenLastCalledWith(SHADOW_DEFAULTS)
    })

    it ("disables the shadow", () => {
        const { onChange } = setup({ ...SHADOW_DEFAULTS })
        fireEvent.click(screen.getByRole("checkbox"))
        expect(onChange).toHaveBeenCalledWith(false)
    })
})
