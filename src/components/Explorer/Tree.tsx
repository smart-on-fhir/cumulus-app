import { ReactNode, useEffect, useState } from "react"
import { useParams }                      from "react-router"
import Loader                             from "../generic/Loader"
import { classList }                      from "../../utils"


export interface DataRow {
    icon     ?: string
    iconColor?: string
    loader   ?: () => Promise<DataRow[]>
    render    : (node: DataRow) => ReactNode
    href     ?: string
    [key: string]: any
}

export default function Tree({
    data
}: {
    data: DataRow[]
})
{
    if (!data.length) {
        return <div className="color-brand-2 p-1">No data found</div>
    }

    return (
        <div className="tree">
            <div>
                { data.map((row, i) => <Row node={row} key={i} />) }
            </div>
        </div>
    )
}

function Row({ node }: { node: DataRow }) {
    const currentPath = String(useParams()["*"] || "")
    const [loading , setLoading ] = useState(false)
    const [children, setChildren] = useState<DataRow[]>([])
    const [error   , setError   ] = useState<Error | string>("")
    const [isOpen  , setIsOpen  ] = useState<boolean|undefined>(
        node.open || (
            currentPath !== node.id &&
            !!node.loader &&
            currentPath.startsWith(node.id)
        )
    )
    
    const length = children.length

    useEffect(() => {
        if (isOpen && !!node.loader && length === 0) {
            setLoading(true)
            node.loader()
                .then(setChildren)
                .catch(setError)
                .finally(() => setLoading(false))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, length])

    return (
        <div className={ classList({
            details: true,
            "has-children": !!node.loader || children.length > 0
        }) }>
            <summary>
                { !!node.loader && <b className="toggle" onClick={e => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }} >{ isOpen ? "▾" : "▸" }</b> }
                <label
                    data-tooltip={ error ? error + "" : node.title }
                    className={ node.id && node.id === currentPath ? "selected" : undefined }>
                    { loading ?
                        <Loader msg="" /> :
                        <span className="icon icon-2 material-symbols-outlined" style={{
                            color: !!node.loader ? isOpen ? "#C60" : "#888" : "#1b5dab"
                        }}>{ node.icon || (!!node.loader || children.length ? "folder_open" : "draft") }</span>
                    }
                    { error ? error + "" : node.render(node) }
                </label>
            </summary>
            { isOpen ?
                children.length > 0 ?
                    children.map((child, i) => <Row key={i} node={{ iconColor: node.iconColor, ...child }} />) :
                    loading ?
                        null :
                        <div className="details">
                            <summary>
                                <label className="color-muted">&nbsp; No Items</label>
                            </summary>
                        </div> :
                null
            }
        </div>
    )
}
