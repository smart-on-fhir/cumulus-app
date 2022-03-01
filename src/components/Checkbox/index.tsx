import { classList } from "../../utils"
import "./Checkbox.scss"


export default function Checkbox({
    checked,
    onChange,
    name,
    label,
    description,
    type,
    className
}: {
    checked     : boolean
    onChange    : (checked: boolean) => void
    name        : string
    label      ?: string
    description?: string
    type       ?: "checkbox" | "radio"
    className  ?: string
}) {
    return (
        <label className={ classList({ "checkbox-label": true, [className || ""]: !!className })}>
            <input
                type={ type || "checkbox" }
                checked={ checked }
                onChange={ e => onChange(e.target.checked) }
            /><span className="checkbox-label-focus-highlight"/>
            { label || name }
            <div className="checkbox-label-description color-muted">
                { description }
            </div>
        </label>
    )
}