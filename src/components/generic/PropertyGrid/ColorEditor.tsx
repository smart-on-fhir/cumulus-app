import { EditableProperty } from "./types"


export default function ColorEditor({ prop }: { prop: EditableProperty }) {

    let c = String(prop.value || "#000000")

    if (c.match(/^#[0-9A-F]{3}$/i)) {
        c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]
    }
    else if (c.match(/^#[0-9A-F]{8}$/i)) {
        c = c.substring(0, 7)
    }

    return (
        <span style={{ display: "flex" }}>
            <input
                type="color"
                value={ c }
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