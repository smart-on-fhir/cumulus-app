import { useState } from "react"
import BooleanEditor from "./BooleanEditor"
import ColorEditor from "./ColorEditor"
import NumberEditor from "./NumberEditor"

interface ShadowProps {
    color  ?: string
    offsetX?: number
    offsetY?: number
    width  ?: number
    opacity?: number
}

export default function ShadowEditor({
    props,
    onChange,
    name = "Shadow",
    description
}: {
    props: ShadowProps | false,
    onChange: (props: ShadowProps | boolean) => void
    name?: string
    description?: string
}) {
    const p = props === false ? {} : props

    const [open, setOpen] = useState(false)

    let title = [ description, "Click to " + (open ? "collapse" : "expand") ]

    return (
        <>
            <b
                className={ "prop-label group-heading" + (open ? " open" : "") }
                onClick={() => setOpen(!open)}
                title={ title.filter(Boolean).join("\n") }
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setOpen(!open)
                    }
                }}
            >
                <i className={ "fa-solid " + (open ? "fa-caret-down" : "fa-caret-right") } />
                { name }
            </b>
            { open ? <>
                <div className="prop-label" style={{ paddingLeft: "1.3em" }}>Enabled</div>
                <div className="prop-editor">
                    <BooleanEditor prop={{
                        name: "Enabled",
                        type: "boolean",
                        // @ts-ignore
                        value: props !== false,
                        onChange: (on: boolean) => onChange(on ? {} : false),
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: "1.3em" }}>Color</div>
                <div className="prop-editor">
                    <ColorEditor prop={{
                        name : "Color",
                        type : "color",
                        value: p.color,
                        onChange(color: string) {
                            onChange({ ...(p || {}), color})
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: "1.3em" }}>OffsetX</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "OffsetX",
                        type : "number",
                        value: p.offsetX ?? 1,
                        onChange(offsetX?: number) {
                            onChange({ ...(p || {}), offsetX})
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: "1.3em" }}>OffsetY</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "OffsetY",
                        type : "number",
                        value: p.offsetY ?? 1,
                        onChange(offsetY?: number) {
                            onChange({ ...(p || {}), offsetY})
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: "1.3em" }}>Width</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "Width",
                        type : "number",
                        value: p.width ?? 3,
                        min  : 0,
                        max  : 30,
                        onChange(width?: number) {
                            onChange({ ...(p || {}), width})
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: "1.3em" }}>Opacity</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "Opacity",
                        type : "number",
                        value: p.opacity ?? 0.15,
                        min  : 0,
                        max  : 1,
                        step : 0.01,
                        onChange(opacity?: number) {
                            onChange({ ...(p || {}), opacity})
                        }
                    }} />
                </div>
            </> : null }
        </>
    )
}
