import { EditableProperty } from "./types"


export interface EditableLengthProperty extends EditableProperty {
    value?: string
    onChange: (value?: string) => void
    min?: number
    max?: number
    step?: number
    units?: string[]
}

export default function LengthEditor({ prop }: { prop: EditableLengthProperty }) {
    const { value = "", min, max, step, units = [], onChange } = prop
    const v = parseFloat(value)
    const u = value.match(/\d+(.*)$/)?.[1] || units[0] || ""
    return (
        <div style={{ display: "flex" }}>
            <input
                type="number"
                value={ isNaN(v) ? "" : v }
                onChange={ e => onChange(
                    isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber + u
                ) }
                min={ min }
                max={ max }
                step={ step }
            />
            <select value={ u } onChange={ e => onChange(isNaN(v) ? undefined : v + e.target.value) }>
                { (units || []).map((u, i) => <option key={ i } value={ u }>{ u }</option> ) }
            </select>
        </div>
    )
}