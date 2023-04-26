import { Link } from "react-router-dom"
import "./breadcrumbs.scss"

export default function Breadcrumbs({ links }: { links: { name: string, href?: string }[] })
{
    return (
        <div className="breadcrumbs">
            { links.map((link, i) => (
                <span key={i}>
                { i > 0 && <i className="fas fa-chevron-right icon"/> }
                { link.href ? <Link to={link.href}>{link.name}</Link> : <span className="color-muted">{link.name}</span> }
                </span>
            ))}
        </div>
    )
}