import { Link } from "react-router-dom"
import "./breadcrumbs.scss"


export interface BreadcrumbLink {
    name : string
    href?: string
}

let lastLinks: BreadcrumbLink[] | undefined;

export default function Breadcrumbs({ links, historic }: { links: BreadcrumbLink[], historic?: boolean })
{
    const prevLinks = lastLinks ? [...lastLinks] : []
    if (!historic && JSON.stringify(links) !== JSON.stringify(lastLinks)) {
        lastLinks = [...links]
    }
    
    if (historic && prevLinks.length) {
        return (
            <div className="breadcrumbs">
                { prevLinks.map((link, i) => (
                    <span key={i}>
                        { link.href ? <Link to={link.href}>{link.name}</Link> : <span className="color-muted">{link.name}</span> }
                        <i className="fas fa-chevron-right icon"/>
                    </span>
                ))}
                <span className="color-muted">{links.pop()?.name}</span>
            </div>
        )    
    }

    return (
        <div className="breadcrumbs">
            { links.map((link, i) => (
                <span key={i}>
                { i > 0 && <i className="fas fa-chevron-right icon"/> }
                { link.href && i < links.length - 1 ?
                    <Link to={link.href}>{link.name}</Link> :
                    <span className="color-muted">{link.name}</span>
                }
                </span>
            ))}
        </div>
    )
}