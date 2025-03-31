import { KeyboardEvent } from "react"
import { classList }     from "../../../utils"
import "./Toggle.scss"


export default function Toggle({
    checked,
    onChange,
    className,
    disabled
}: {
    checked   : boolean
    onChange  : (checked: boolean) => void
    className?: string
    disabled ?: boolean
}) {
    
    function onkeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onChange(!checked)
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault()
            onChange(false)
        }
        if (e.key === "ArrowRight") {
            e.preventDefault()
            onChange(true)
        }
    }

    return (
        <b
            className={ classList({
                "toggle-input": true,
                [className || ""]: !!className,
                "grey-out": !!disabled,
                "on": !!checked
            })}
            tabIndex={0}
            onKeyDown={onkeydown}
            onClick={() => onChange(!checked)}
        />
    )
}