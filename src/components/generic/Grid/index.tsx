import { ReactNode } from "react"

export default function Grid({
    children,
    className,
    gap,
    cols = "100%",
    style = {}
}: {
    children?: ReactNode
    gap?: string
    className?: string
    cols?: string
    style?: React.CSSProperties
})
{
    if (!Array.isArray(children)) {
        children = [children]
    }

    const _cols = cols.trim().split(/\s+/).filter(Boolean)
    const gridTemplateColumns = _cols.length > 1 ?
        _cols.join(" ") :
        `repeat(auto-fill, minmax(${_cols[0] || "100%"}, 1fr))`

    return (
        <div className={className} style={{ ...style, display: "grid", gridGap: gap, gridTemplateColumns }}>
            { children }
        </div>
    )
}