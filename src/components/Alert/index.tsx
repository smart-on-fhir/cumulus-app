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
    children: (JSX.Element | string)|(JSX.Element | string)[]
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

export function AlertError({ children }: { children: (JSX.Element | string)|(JSX.Element | string)[] }) {
    return (
        <Alert className="mt-1 mb-1" color="red" icon="fas fa-exclamation-circle">
            {children}
        </Alert>
    )
}