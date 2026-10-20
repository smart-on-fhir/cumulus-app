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

/**
 * The values shown for options that are not set. Every change saves the whole
 * shadow, these included: Highcharts fills missing options with its own,
 * different defaults (offsetX 0, offsetY 2, width 6, opacity 0.05), so a
 * partial shadow would not look like what the editor shows.
 */
export const SHADOW_DEFAULTS: Required<ShadowProps> = {
    color  : "#000000",
    offsetX: 1,
    offsetY: 1,
    width  : 3,
    opacity: 0.15
}

export default function ShadowEditor({
    props,
    onChange,
    name = "Shadow",
    description,
    level = 0,
    open
}: {
    props: ShadowProps | boolean | undefined,
    onChange: (props: ShadowProps | boolean) => void
    name?: string
    description?: string
    level?: number
    open?: boolean
}) {
    // `true` means a shadow with default options
    const p: ShadowProps = props && typeof props === "object" ? props : {}

    // The whole shadow as shown, with one option changed (a cleared field
    // goes back to its default)
    const set = (patch: ShadowProps) => onChange({
        ...SHADOW_DEFAULTS,
        ...p,
        ...Object.fromEntries(Object.entries(patch).map(([key, value]) => [
            key,
            value ?? SHADOW_DEFAULTS[key as keyof ShadowProps]
        ]))
    })

    const [_open, setOpen] = useState(!!open)

    let title = [ description, "Click to " + (_open ? "collapse" : "expand") ]

    let pl = (level: number) => 3 + (level * 16)

    return (
        <>
            <b
                className={ "prop-label group-heading" + (_open ? " open" : "") + " level-" + level }
                onClick={() => setOpen(!_open)}
                title={ title.filter(Boolean).join("\n") }
                tabIndex={0}
                style={{ paddingLeft: pl(level - 1) }}
                onKeyDown={e => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setOpen(!_open)
                    }
                }}
            >
                <i className={ "fa-solid " + (_open ? "fa-caret-down" : "fa-caret-right") } />
                { name }
            </b>
            { _open ? <>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Enabled</div>
                <div className="prop-editor">
                    <BooleanEditor prop={{
                        name: "Enabled",
                        type: "boolean",
                        value: props !== undefined && props !== false,
                        onChange: (on: boolean) => onChange(on ? { ...SHADOW_DEFAULTS, ...p } : false),
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Color</div>
                <div className="prop-editor">
                    <ColorEditor prop={{
                        name : "Color",
                        type : "color",
                        value: p.color ?? SHADOW_DEFAULTS.color,
                        onChange(color: string) {
                            set({ color })
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>OffsetX</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "OffsetX",
                        type : "number",
                        value: p.offsetX ?? SHADOW_DEFAULTS.offsetX,
                        onChange(offsetX?: number) {
                            set({ offsetX })
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>OffsetY</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "OffsetY",
                        type : "number",
                        value: p.offsetY ?? SHADOW_DEFAULTS.offsetY,
                        onChange(offsetY?: number) {
                            set({ offsetY })
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Width</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "Width",
                        type : "number",
                        value: p.width ?? SHADOW_DEFAULTS.width,
                        min  : 0,
                        max  : 10,
                        onChange(width?: number) {
                            set({ width })
                        }
                    }} />
                </div>
                <div className="prop-label" style={{ paddingLeft: pl(level + 1) }}>Opacity</div>
                <div className="prop-editor">
                    <NumberEditor prop={{
                        name : "Opacity",
                        type : "number",
                        value: p.opacity ?? SHADOW_DEFAULTS.opacity,
                        min  : 0,
                        max  : 1,
                        step : 0.01,
                        onChange(opacity?: number) {
                            set({ opacity })
                        }
                    }} />
                </div>
            </> : null }
        </>
    )
}
