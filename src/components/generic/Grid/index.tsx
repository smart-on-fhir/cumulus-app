export default function Grid({
    children,
    colMinWidth = "100%",
    className,
    gap,
}: {
    children?: JSX.Element | string | null | undefined | (JSX.Element | string | undefined | null)[]
    gap?: string
    colMinWidth?: string
    className?: string
})
{
    if (!Array.isArray(children)) {
        children = [children]
    }

    return <div className={className} style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${colMinWidth}, 1fr))`,
        gridGap: gap
    }}>
        { children }
    </div>
}