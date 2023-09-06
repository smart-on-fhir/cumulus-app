import { EditableProperty } from "./types"


export default function ColorEditor({ prop }: { prop: EditableProperty }) {
    return (
        <span style={{ display: "flex" }}>
            <input
                type="color"
                value={ prop.value || "#000000" }
                onChange={ e => prop.onChange(e.target.value) }
                className={ prop.value ? undefined : "empty" }
                disabled={!!prop.disabled}
            />
            <input
                type="text"
                value={ prop.value || "" }
                onChange={ e => prop.onChange(e.target.value) }
            />
        </span>
    )
}