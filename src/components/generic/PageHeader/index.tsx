import { ReactNode } from "react"
import Markdown from "../Markdown"


export default function PageHeader({
    title,
    icon,
    description
}: {
    title: ReactNode
    icon?: string
    description?: string
}) {
    return (
        <header className="row mt-2 mb-2">
            { icon && <h2 className="mt-0 mr-1 col col-0">
                <i className="icon material-symbols-outlined color-brand-2" style={{ lineHeight: 1.4 }}>{icon}</i>
            </h2> }
            <div className="col">
                <h2 className="mt-0 mb-0">{title}</h2>
                {/* <hr/> */}
                { description && <div className="color-muted"><Markdown>{description}</Markdown></div> }
            </div>
        </header>
    )
}