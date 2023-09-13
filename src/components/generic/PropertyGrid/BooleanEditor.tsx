import { EditableProperty } from "./types"


export default function BooleanEditor({ prop }: { prop: EditableProperty }) {
    return (
        <label>
            <input
                type="checkbox"
                disabled={ !!prop.disabled }
                checked={ prop.value }
                onChange={ () => prop.onChange(!prop.value) }
            />&nbsp;{ prop.value + "" }
        </label>
    )
}
