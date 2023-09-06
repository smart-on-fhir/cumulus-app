import { EditableNumberProperty } from "./types"


export default function NumberEditor({ prop }: { prop: EditableNumberProperty }) {
    const { value, min, max, step, onChange, disabled } = prop
    return (
        <input
            type="number"
            value={ value ?? "" }
            onChange={ e => onChange(isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber) }
            min={ min }
            max={ max }
            step={ step }
            disabled={ !!disabled }
        />
    )
}