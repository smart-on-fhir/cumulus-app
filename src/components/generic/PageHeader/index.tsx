import { ReactNode } from "react"
import Markdown from "../Markdown"
import { classList } from "../../../utils";


const htmlPattern = /<[^>]+>/i
const markdownPattern = /(?:^|\n)\s*(#{1,6}\s|[*-]\s|\d+\.\s)|(\*\*.*?\*\*|__.*?__)|(_.*?_|\*.*?\*)|(```[\s\S]*?```|`[^`]+`)|(!?\[.*?\]\(.*?\))/;

export default function PageHeader({
    title,
    icon,
    description,
    markdown = false,
    className = ""
}: {
    title: ReactNode
    icon?: string
    /** null renders nothing, undefined renders "No description available" */
    description?: string | null
    /** Render the description as markdown even if it does not look like it */
    markdown?: boolean
    className?: string
}) {
    return (
        <header className={ classList({
            row: true,
            "mt-2 mb-2" : !className,
            [className] : !!className
        })}>
            { icon && <h2 className="mt-0 mr-1 col col-0">
                <i className="icon material-symbols-outlined color-brand-2" style={{ lineHeight: 1.4 }}>{icon}</i>
            </h2> }
            <div className="col">
                <h2 className="mt-0 mb-0">{title}</h2>
                {/* <hr/> */}
                <div>
                    { description ?
                        markdown || htmlPattern.test(description) || markdownPattern.test(description) ?
                            <Markdown>{description}</Markdown> :
                            <div className="color-muted">{description}</div> :
                        <div className="color-muted">{ description === null ? null : "No description available" }</div>
                    }
                </div>
            </div>
        </header>
    )
}