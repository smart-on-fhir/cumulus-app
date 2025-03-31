import { CSSProperties } from "react";
import { classList } from "../../../utils";
import "./Alert.scss";


export default function Alert({
    children,
    className,
    color,
    icon,
    style
}: {
    color?: "blue"|"red"|"orange"|"grey"|"green",
    className?: string
    icon?: string
    children: JSX.Element | string | (JSX.Element | string)[],
    style?: CSSProperties
}) {
    return (
        <div className={ classList({
            alert: true,
            ["alert-" + color]: !!color,
            [className || ""]: !!className
        }) } style={style}>
            { icon && <i className={ classList({ "icon": true, [icon]: true })}/> }
            {children}
        </div>
    )
}

export function AlertError({ className, style, children = "Unknown error" }: {
    children?: JSX.Element | string | Error | (JSX.Element | string | Error)[],
    className?: string,
    style?: CSSProperties
}) {
    children = Array.isArray(children) ? children : [children]
    return (
        <Alert className={ classList({
            [className || ""]: !!className,
            " mt-1 mb-1": true
        })} color="red" icon="fas fa-exclamation-circle" style={style}>
            { children.map((c, i) => {
                if (c instanceof Error) {
                    return <span key={i}>{ c.message }</span>
                }
                return <span key={i}>{ c }</span>
            })}
        </Alert>
    )
}