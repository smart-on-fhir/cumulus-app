import { useState }             from "react"
import { DataRow }              from "./Catalog"
import MAPPING                  from "./DataMapping"
import { classList, highlight } from "../../utils"


export default function Tree({
    data,
    search
}: {
    data: DataRow[]
    search?: string
})
{
    const { id, pid, stratifier } = MAPPING
    
    let children = data.filter(row => row[pid] === null)
    if (stratifier) {
        children = children.filter(row => row[stratifier] === null)
    }

    return (
        <div className="catalog-tree">
            <div key={search}>
                { children.map((row, i) => (
                    <Row data={data} id={row[id] as  string | number} key={i} search={search} open expandOnSearch={data.length < 1000} />
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
    expandOnSearch
}: {
    data: DataRow[]
    id: string | number
    open?: boolean
    search?: string
    expandOnSearch?: boolean
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
                    <span>
                        <b>{ search ? highlight(node[label] + "", search) : node[label] } </b>
                        { description && (search ? highlight(node[description] + "", search) : node[description]) }
                    </span>
                    { count && <span className="badge">{Number(node[count]).toLocaleString()}</span> }
                </label>
            </summary>
            { ((expandOnSearch && !!search) || isOpen) && children.map((row, i) => (
                <Row data={data} id={row[idColumn] as string | number} key={i} search={search} expandOnSearch={expandOnSearch} />
            ))}
        </details>
    )
}