import { CSSProperties } from "react"
import { EditableProperty } from "./types"

export interface EditableStringProperty extends EditableProperty {
    value?: string
    onChange: (value: string) => void
    minLength?: number
    maxLength?: number
    required?: boolean
    autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters"
    disabled?: boolean
    title?: string
    style?: CSSProperties
    spellCheck?: boolean
    placeholder?: string
}

export default function StringEditor({ prop }: { prop: EditableStringProperty }) {
    const {
        value, minLength, maxLength, required, onChange, autoCapitalize,
        disabled, title, style, spellCheck, placeholder
    } = prop

    return (
        <input
            type="text"
            value={ value }
            onChange={ e => onChange(e.target.value) }
            minLength={ minLength }
            maxLength={ maxLength }
            required={ required }
            autoCapitalize={ autoCapitalize }
            disabled={ disabled }
            title={ title }
            style={ style }
            spellCheck={ spellCheck }
            placeholder={ placeholder }
        />
    )
}