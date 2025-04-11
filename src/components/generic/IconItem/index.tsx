import { HTMLAttributes } from "react"
import { classList }      from "../../../utils"


interface IconItemProps extends HTMLAttributes<HTMLDivElement> {
    icon: string
}

export default function IconItem(props: IconItemProps) {
    const { icon, children, className, ...rest } = props
    return (
        <div className={ classList({ [className]: true, row: true }) } { ...rest }>
            <div className="mt-0 mr-05 col col-0">
                <i className="icon material-symbols-outlined color-brand-2" style={{
                    lineHeight: "1.2em",
                    fontSize  : "1.6em",
                }}>{ icon }</i>
            </div>
            <div className="col">
                { children }
            </div>
        </div>
    )
}