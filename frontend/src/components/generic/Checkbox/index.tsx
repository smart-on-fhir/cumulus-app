import { classList } from "../../../utils"
import "./Checkbox.scss"


export default function Checkbox({
    checked,
    onChange,
    name,
    label,
    description,
    type,
    className,
    disabled,
    labelLeft
}: {
    checked     : boolean
    onChange    : (checked: boolean) => void
    name        : string
    label      ?: string | JSX.Element
    description?: string
    type       ?: "checkbox" | "radio"
    className  ?: string
    disabled   ?: boolean
    labelLeft  ?: boolean
}) {
    return (
        <label className={ classList({
            "checkbox-label": true,
            [className || ""]: !!className,
            "grey-out": !!disabled,
            "label-left": !!labelLeft
        })}>
            { labelLeft && (label || name) }
            <input
                type={ type || "checkbox" }
                checked={ checked }
                disabled={ !!disabled }
                onChange={ e => onChange(e.target.checked) }
            /><span className="checkbox-label-focus-highlight"/>
            { !labelLeft && (label || name) }
            <div className="checkbox-label-description color-muted">
                { description }
            </div>
        </label>
    )
}