import "./Tag.scss"

export default function Tag({ tag }: { tag: Pick<app.Tag, "name" | "description">})
{
    return <span className="tag" title={ tag.description || undefined }>{ tag.name }</span>
}