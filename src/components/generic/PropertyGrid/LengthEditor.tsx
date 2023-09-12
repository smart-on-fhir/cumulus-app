import { EditableProperty } from "./types"


export interface EditableLengthProperty extends EditableProperty {
    value?: string
    onChange: (value?: string) => void
    min?: number
    max?: number
    step?: number
    units?: (string|{value: any, text: string})[]
}

export default function LengthEditor({ prop }: { prop: EditableLengthProperty }) {
    const { value = "", min, max, step, units = [], onChange, disabled } = prop
    const v = parseFloat(value)
    const u = String(value).match(/\d+(.*)$/)?.[1] ||
        (units[0] ?
            typeof units[0] === "string" ? units[0] : units[0].value : "") || ""
    return (
        <div style={{ display: "flex", width: "100%" }}>
            <input
                type="number"
                value={ isNaN(v) ? "" : v }
                onChange={ e => onChange(
                    isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber + u
                ) }
                min={ min }
                max={ max }
                step={ step }
                disabled={ disabled }
            />
            <select
                value={ u }
                onChange={ e => onChange(isNaN(v) ? undefined : v + e.target.value) }
                disabled={ disabled }>
                { (units || []).map((unit, i) => {
                    if (typeof unit === "string") {
                        return <option key={ i } value={ unit }>{ unit }</option>
                    }
                    return <option key={ i } value={ unit.value }>{ unit.text }</option>
                }) }
            </select>
        </div>
    )
}