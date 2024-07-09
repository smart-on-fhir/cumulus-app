import { useEffect, useRef } from "react"
import { EditableProperty }  from "./types"


export default function BooleanEditor({ prop }: { prop: EditableProperty }) {
    return (
        <label>
            <CheckBox
                type="checkbox"
                disabled={ !!prop.disabled }
                checked={ prop.indeterminate ? undefined : prop.value }
                onChange={ () => prop.onChange(!prop.value) }
                indeterminate={ prop.indeterminate }
            />{ prop.indeterminate ? "mixed" : prop.value + "" }
        </label>
    )
}



interface CheckBoxProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    indeterminate?: boolean
}

export function CheckBox(props: CheckBoxProps = {}) {
    const ref = useRef<HTMLInputElement>(null)
    const { indeterminate, ...rest } = props
    useEffect(() => {
        if (indeterminate !== undefined && ref.current) {
            ref.current.indeterminate = indeterminate
        }
    }, [indeterminate])
    return <input { ...rest } type="checkbox" ref={ref} />
}

