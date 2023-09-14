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
    description,
    level = 0
}: {
    props: ShadowProps | false,
    onChange: (props: ShadowProps | boolean) => void
    name?: string
    description?: string
    level?: number
}) {
    const p = props === false ? {} : props

    const [open, setOpen] = useState(false)

    let title = [ description, "Click to " + (open ? "collapse" : "expand") ]

    let pl = (level: number) => 3 + (level * 16)

    return (
        <>
            <b
                className={ "prop-label group-heading" + (open ? " open" : "") + " level-" + level }
                onClick={() => setOpen(!open)}
                title={ title.filter(Boolean).join("\n") }
                tabIndex={0}
                style={{ paddingLeft: pl(level) }}
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
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Enabled</div>
                <div className="prop-editor">
                    <BooleanEditor prop={{
                        name: "Enabled",
                        type: "boolean",
                        // @ts-ignore
                        value: props !== false,
                        onChange: (on: boolean) => onChange(on ? {} : false),
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Color</div>
                <div className="prop-editor">
                    <ColorEditor prop={{
                        name : "Color",
                        type : "color",
                        value: p.color ?? "#000000",
                        onChange(color: string) {
                            onChange({ ...(p || {}), color})
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>OffsetX</div>
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
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>OffsetY</div>
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
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Width</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "Width",
                        type : "number",
                        value: p.width ?? 3,
                        min  : 0,
                        max  : 10,
                        onChange(width?: number) {
                            onChange({ ...(p || {}), width})
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Opacity</div>
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
