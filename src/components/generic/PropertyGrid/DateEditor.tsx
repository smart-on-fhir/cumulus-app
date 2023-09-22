import { EditableDateProperty } from "./types"


export default function DateEditor({ prop }: { prop: EditableDateProperty }) {
    const { value, min, max, onChange, disabled, onContextMenu } = prop
    const d = new Date(value || 0)
    const s = `${
        d.getUTCFullYear()
    }-${
        String(d.getUTCMonth()+1).padStart(2, "0")
    }-${
        String(d.getUTCDate()).padStart(2, "0")
    }`
    return (
        <input
            type="date"
            value={ s }
            onChange={ e => onChange(e.target.valueAsDate ? e.target.value : undefined) }
            min={ min }
            max={ max }
            disabled={ !!disabled }
            onContextMenu={onContextMenu}
        />
    )
}