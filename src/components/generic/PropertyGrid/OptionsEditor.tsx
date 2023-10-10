import { CSSProperties } from "react"
import { EditableProperty } from "./types"

export interface EditableOptionsProperty extends EditableProperty {
    value?: string
    onChange: (value: string) => void
    required?: boolean
    disabled?: boolean
    title?: string
    style?: CSSProperties
    options?: (Option | OptGroup)[]
}

export type Option = string | OptionObject
export type OptionObject = { value: string, label: string, disabled?: boolean }
export type OptGroup = { value: Option[], label: string, disabled?: boolean }

export default function OptionsEditor({ prop }: { prop: EditableOptionsProperty }) {
    const { value, required, onChange, disabled, title, style, options = [] } = prop

    function flatten(input: (Option | OptGroup)[]): any[] {
        return input.reduce((prev, cur) => {
            if (typeof cur === "string") {
                prev.push(cur)
            }
            else if (Array.isArray(cur.value)) {
                prev.push(...flatten(cur.value))
            }
            else {
                prev.push(cur.value)
            }
            return prev
        }, [] as any[])
    }

    const flat = flatten(options)

    return (
        <select
            value={ value + "" }
            onChange={ e => onChange(flat[e.target.selectedIndex]) }
            required={ required }
            disabled={ disabled }
            title={ title }
            style={ style }
        >
            <Options options={options} />
        </select>
    )
}

function Options({ options }: { options: (Option | OptGroup)[] }) {
    return <>{ options.map((o, i) => {
        if (typeof o === "string") {
            return <option key={i} value={o}>{o}</option>
        }
        if (Array.isArray(o.value)) {
            return <optgroup key={i} label={o.label} disabled={o.disabled}>
                <Options options={o.value} />
            </optgroup>
        }
        return <option key={i} value={o.value + ""} disabled={o.disabled}>{o.label}</option>
    }) }
    </>
}