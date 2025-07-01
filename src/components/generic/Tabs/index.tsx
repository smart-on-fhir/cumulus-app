import { ReactNode, useState } from "react"
import { useSearchParams }     from "react-router-dom"
import "./Tabs.scss"


export function Tabs({
    children,
    selectedIndex = 0,
    searchParam
}: {
    selectedIndex?: number
    /** If set, a query string param with this name will be used to store the selected tab index */
    searchParam?: string
    children: {
        name: ReactNode
        children: ReactNode
    }[]
}) {
    const [query, setQuery] = useSearchParams()
    const initialIndex = searchParam ? parseInt(query.get(searchParam) || "0", 10) : selectedIndex;
    const [index, setIndex] = useState(Math.max(Math.min(initialIndex, children.length - 1), 0))

    function getTabIndex() {
        if (searchParam) {
            return parseInt(query.get(searchParam) || "0", 10)
        }
        return index
    }

    function setTabIndex(idx: number) {
        idx = Math.min(idx, children.length - 1)
        setIndex(idx)
        if (searchParam) {
            query.set(searchParam, idx + "")
            setQuery(query)
        }
    }

    const _selectedIndex = getTabIndex()

    return (
        <>
            <div className="tabs">
                { children.map((c, i) => (
                    <div
                        className={ "tab-name" + (_selectedIndex === i ? " active" : "") }
                        tabIndex={0}
                        key={i}
                        onClick={() => setTabIndex(i)}
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setTabIndex(i)
                            }
                        }}
                    >{ c.name }</div>
                )) }
                <div className="tabs-spacer"/>
            </div>
            <div className="tabs-content">
                { children[_selectedIndex]?.children }
            </div>
        </>
    )
}
