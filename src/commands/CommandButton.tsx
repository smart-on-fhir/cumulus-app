import { ReactNode } from "react"
import { classList } from "../utils"

export default function CommandButton({
    available,
    working,
    label,
    execute,
    description,
    enabled,
    active,
    icon,
    className = ""
}: {
    working    ?: boolean,
    error      ?: Error | null,
    execute     : () => void,
    label       : ReactNode,
    icon       ?: ReactNode
    available  ?: boolean
    enabled    ?: boolean
    active     ?: boolean
    description?: string
    className  ?: string
}) {
    const classNames = className.trim().split(/\s+/)
    const classes: any = { btn: true, active: !!active }
    classNames.forEach(s => classes[s] = true)

    return available ?
        <button
            className={ classList(classes) }
            onClick={execute}
            data-tooltip={description}
            disabled={!enabled}
        >
            { working ? <i className="fas fa-circle-notch fa-spin" /> : icon }
            { working || (icon && label) ? <>&nbsp;</> : null }
            { label }
        </button>
        : null
}