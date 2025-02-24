import { ReactNode, useEffect, useState } from "react"
import Loader                             from "../generic/Loader"
import { classList }                      from "../../utils"
// import "./Tree.scss"


export interface DataRow {
    icon     ?: string
    iconColor?: string
    loader    : () => Promise<DataRow[]>
    render    : (node: DataRow) => ReactNode
    [key: string]: any
}

export default function Tree({
    data,
    onSelect,
    path = ""
}: {
    data: DataRow[]
    onSelect?: (selection: any) => void
    path?: string
})
{
    if (!data.length) {
        return <div className="color-brand-2 p-1">No data found</div>
    }

    return (
        <div className="tree">
            <div>
                { data.map((row, i) => (
                    <Row node={row} key={i} onSelect={onSelect} path={path} />
                )) }
            </div>
        </div>
    )
}

function Row({
    node,
    onSelect,
    path
}: {
    node      : DataRow
    onSelect ?: (node: DataRow) => void
    path      : string
}) {
    // const shouldOpen = !!node.loader && node.id && path.startsWith(node.id)
    const [isOpen  , setIsOpen  ] = useState<boolean|undefined>()
    const [loading , setLoading ] = useState(false)
    const [children, setChildren] = useState<DataRow[]>([])
    const [error   , setError   ] = useState<Error | string>("")
    
    const length = children.length

    // if the user closed the node manually, but then load a subpath, we must
    // ignore that choice and force open
    const _open = isOpen ?? (path !== node.id && !!node.loader && path.startsWith(node.id))

    useEffect(() => {
        if (_open && !!node.loader && length === 0) {
            setLoading(true)
            node.loader()
                .then(setChildren)
                // .then(() => setIsOpen(true))
                .catch(setError)
                .finally(() => setLoading(false))
        }
        
        // if (node.id === path) {
        //     onSelect?.(node)
        // }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_open, path, length])

    

    return (
        <div className={ classList({
            details: true,
            "has-children": !!node.loader || children.length > 0
        }) }>
            <summary>
                { !!node.loader && <b className="toggle" onClick={e => {
                    e.stopPropagation()
                    setIsOpen(!_open)
                }} >{ _open ? "▾" : "▸" }</b> }
                <label
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(node)
                    }}
                    data-tooltip={ error ? error + "" : node.title }
                    className={ node.id && node.id === path ? "selected" : undefined}>
                    { loading ?
                        <Loader msg="" /> :
                        <span className={ classList({
                            "icon icon-2 material-symbols-outlined": true,
                            "color-blue": !node.icon && !node.loader && children.length === 0,
                            "color-brand-2": !node.icon && (!!node.loader || children.length > 0)
                        })} style={{
                            color: node.iconColor
                        }}>{ node.icon || (!!node.loader || children.length ? "folder_open" : "draft") }</span>
                    }
                    { error ? error + "" : node.render(node) }
                </label>
            </summary>
            { _open ?
                children.length > 0 ?
                    children.map((child, i) => (
                        <Row
                            node={{ iconColor: node.iconColor, ...child }}
                            key={i}
                            // key={[i, node.id !== path && path.startsWith(node.id) ? path : ""].join(":")}
                            // key={node.id}
                            // key={ path === node.id ? "open" : i }
                            onSelect={onSelect}
                            path={path}
                        />
                    )) :
                    loading ?
                        null :
                        <div className="details"><summary><label className="color-muted">&nbsp; No Items</label></summary></div> :
                null
            }
        </div>
    )
}
