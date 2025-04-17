import { ReactNode } from "react"
import Markdown from "../Markdown"


const markdownPattern = /(?:^|\n)\s*(#{1,6}\s|[*-]\s|\d+\.\s)|(\*\*.*?\*\*|__.*?__)|(_.*?_|\*.*?\*)|(```[\s\S]*?```|`[^`]+`)|(!?\[.*?\]\(.*?\))/;

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
                <div>
                    { description ?
                        markdownPattern.test(description) ?
                            <Markdown>{description}</Markdown> :
                            <div className="color-muted">{description}</div> :
                        <div className="color-muted">No description available</div>
                    }
                </div>
            </div>
        </header>
    )
}