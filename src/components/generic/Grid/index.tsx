export default function Grid({
    children,
    className,
    gap,
    cols = "100%"
}: {
    children?: JSX.Element | string | null | undefined | (JSX.Element | string | undefined | null)[]
    gap?: string
    className?: string
    cols?: string
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
        <div className={className} style={{ display: "grid", gridGap: gap, gridTemplateColumns }}>
            { children }
        </div>
    )
}