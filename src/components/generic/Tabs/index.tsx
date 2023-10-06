import { ReactChild, ReactNode, useLayoutEffect, useState } from "react"
import "./Tabs.scss"

export function Tabs({
    children,
    selectedIndex = 0
}: {
    selectedIndex?: number
    children: {
        name: ReactChild
        children: ReactNode
    }[]
}) {
    const [index, setIndex] = useState(
        Math.max(Math.min(selectedIndex, children.length - 1), 0)
    )

    useLayoutEffect(() => {
        if (selectedIndex > -1) {
            setIndex(Math.min(selectedIndex, children.length - 1))
        }
    }, [selectedIndex, children.length, setIndex])

    return (
        <>
            <div className="tabs">
                { children.map((c, i) => (
                    <div
                        className={ "tab-name" + (index === i ? " active" : "") }
                        tabIndex={0}
                        key={i}
                        onClick={() => setIndex(i)}
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setIndex(i)
                            }
                        }}
                    >{ c.name }</div>
                )) }
                <div className="tabs-spacer"/>
            </div>
            <div className="tabs-content">
                { children[index]?.children }
            </div>
        </>
    )
}
