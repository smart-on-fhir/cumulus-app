import { Link } from "react-router-dom"
import "./Tag.scss"

export default function Tag({ tag, noLink }: { tag: Pick<app.Tag, "name" | "description" | "id">, noLink?: boolean })
{
    return noLink ?
        <span className="tag" title={ tag.description || undefined }>{ tag.name }</span> :
        <Link className="tag" title={ tag.description || undefined } to={`/tags/${tag.id}`}>{ tag.name }</Link>;
}