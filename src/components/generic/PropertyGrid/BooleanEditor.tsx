import { EditableProperty } from "./types"


export default function BooleanEditor({ prop }: { prop: EditableProperty }) {
    return (
        <input
            type="checkbox"
            disabled={ !!prop.disabled }
            checked={ prop.value }
            onChange={ () => prop.onChange(!prop.value) }
        />
    )
}
