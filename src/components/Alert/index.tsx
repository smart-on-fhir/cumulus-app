import { classList } from "../../utils";
import "./Alert.scss";


export default function Alert({
    children,
    className,
    color,
    icon
}: {
    color?: "blue"|"red"|"orange"|"grey"|"grey-dark"|"green",
    className?: string
    icon?: string
    children: JSX.Element | string | (JSX.Element | string)[]
}) {
    return (
        <div className={ classList({
            alert: true,
            ["alert-" + color]: !!color,
            [className || ""]: !!className
        }) }>
            { icon && <i className={ classList({ "icon": true, [icon]: true })}/> }
            {children}
        </div>
    )
}

export function AlertError({ className, children = "Unknown error" }: {
    children?: JSX.Element | string | Error | (JSX.Element | string | Error)[],
    className?: string
}) {
    children = Array.isArray(children) ? children : [children]
    return (
        <Alert className={ classList({
            [className || ""]: !!className,
            " mt-1 mb-1": true
        })} color="red" icon="fas fa-exclamation-circle">
            { children.map((c, i) => {
                if (c instanceof Error) {
                    return <div key={i}>{ c.message }</div>
                }
                return <div key={i}>{ c }</div>
            })}
        </Alert>
    )
}