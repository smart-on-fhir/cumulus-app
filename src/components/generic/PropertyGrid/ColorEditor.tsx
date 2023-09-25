import { EditableProperty } from "./types"

function parse(s: any) {
    s = String(s || "").trim()
    if (s.startsWith("#")) {
        if (s.length === 4) { // #RGB
            return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
        }
        else if (s.length === 5) { // #RGBA
            return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}${s[4]}${s[4]}`
        }
    }    
    return s
}


export default function ColorEditor({ prop }: { prop: EditableProperty }) {

    let c = parse(prop.value)

    return (
        <span className="color-editor" style={{ display: "flex" }}>
            <input
                type="color"
                value={ c }
                onChange={ e => prop.onChange(e.target.value) }
                className={ prop.value ? undefined : "empty" }
                disabled={!!prop.disabled}
                style={{ background: `linear-gradient(${c}, ${c}), repeating-linear-gradient(-45deg, #FFF, #CCC 2px, #FFF 3px, #FFF 4px)` }}
            />
            <input
                type="text"
                value={ prop.value || "" }
                onChange={ e => prop.onChange(e.target.value) }
                spellCheck={false}
            />
        </span>
    )
}