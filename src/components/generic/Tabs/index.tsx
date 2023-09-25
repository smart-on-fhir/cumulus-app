import { ReactChild, ReactNode, useState } from "react"
import "./Tabs.scss"

export function Tabs({
    children
}: {
    children: {
        name: ReactChild
        children: ReactNode
    }[]
}) {
    const [index, setIndex] = useState(0)

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
            { children[index]?.children }
        </>
    )
}
