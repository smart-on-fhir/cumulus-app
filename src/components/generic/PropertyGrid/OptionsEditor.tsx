import { CSSProperties } from "react"
import { EditableProperty } from "./types"

export interface EditableOptionsProperty extends EditableProperty {
    value?: string
    onChange: (value: string) => void
    required?: boolean
    disabled?: boolean
    title?: string
    style?: CSSProperties
    options?: string[]
}

export default function OptionsEditor({ prop }: { prop: EditableOptionsProperty }) {
    const { value, required, onChange, disabled, title, style, options = [] } = prop

    return (
        <select
            value={ value }
            onChange={ e => onChange(e.target.value) }
            required={ required }
            disabled={ disabled }
            title={ title }
            style={ style }
        >
            { options.map((o, i) => <option key={i} value={o}>{o}</option>) }
        </select>
    )
}