import { useState }             from "react"
import { DataRow }              from "./Catalog"
import MAPPING                  from "./DataMapping"
import { classList, highlight } from "../../utils"


export default function Tree({
    data,
    search,
    navigate
}: {
    data: DataRow[]
    search?: string
    navigate?: (...args: any[]) => void
})
{
    const { id, pid, stratifier } = MAPPING
    
    let children = data.filter(row => row[pid] === null)
    if (stratifier) {
        children = children.filter(row => row[stratifier] === null)
    }

    if (!data.length) {
        return search ? 
            <div className="color-brand-2 p-1">No results found matching your search</div> :
            <div className="color-brand-2 p-1">No data found</div>
    }

    return (
        <div className="catalog-tree">
            <div key={search}>
                { children.map(row => (
                    <Row data={data} id={row[id] as  string | number} key={"/" + row[id]} search={search} open={ children.length < 2 } expandOnSearch={data.length < 1000} navigate={navigate} />
                )) }
            </div>
        </div>
    )
}

function Row({
    id,
    data,
    open,
    search,
    expandOnSearch,
    navigate,
    key
}: {
    data: DataRow[]
    id: string | number
    open?: boolean
    search?: string
    expandOnSearch?: boolean
    navigate?: (...args: any[]) => void
    key: string
}) {
    const [isOpen, setIsOpen] = useState(!!open)
    const { id: idColumn, pid: pidColumn, label, count, description, stratifier } = MAPPING
    const node = data.find(row => row[idColumn] === id)!
    
    let children = data.filter(row => row[pidColumn] === node[idColumn])
    let tooltip: string | undefined;
    if (stratifier) {
        const siblings = data.filter(row => row[pidColumn] === node[pidColumn] && row[idColumn] !== node[idColumn] && row[stratifier] !== null && row[label] === node[label]);
        tooltip = siblings.map(row => `${row[stratifier]}: ${Number(row[count]).toLocaleString()}`).join('<br/>')
        children = children.filter(row => row[stratifier] === null)
    }

    return (
        <details open={(expandOnSearch && !!search) || isOpen} onToggle={e => {
            e.stopPropagation()
            // @ts-ignore
            setIsOpen(!!e.target.open)
        }} className={ classList({
            "has-children": children.length > 0
        }) }>
            <summary>
                <label data-tooltip={tooltip}>
                    <span className={ classList({
                        "icon icon-2 material-symbols-rounded": true,
                        "color-blue": children.length === 0,
                        "color-brand-2": children.length > 0
                    })}>{
                        children.length ? "folder_open" : "draft" }
                    </span>
                    <span className={ children.length ? undefined : (navigate ? "color-blue-dark link" : undefined) } onClick={() => children.length ? undefined: navigate?.(node)}>
                        <b>{ search ? highlight(node[label] + "", search) : node[label] } </b>
                        { description && (search ? highlight(node[description] + "", search) : node[description]) }
                    </span>
                    { count && <span className="badge">{Number(node[count]).toLocaleString()}</span> }
                </label>
            </summary>
            { ((expandOnSearch && !!search) || isOpen) && children.map((row, i) => (
                <Row data={data} id={row[idColumn] as string | number} search={search} expandOnSearch={expandOnSearch} navigate={navigate} key={[key, node.id].join("/")} />
            ))}
        </details>
    )
}