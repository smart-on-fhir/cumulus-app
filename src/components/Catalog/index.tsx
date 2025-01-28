import { useState }             from "react"
import CatalogChart             from "./Chart"
import MAPPING, { DataMapping } from "./DataMapping"
import { Tabs }                 from "../generic/Tabs"
import StaticGrid               from "../generic/StaticGrid"
import Prefetch                 from "../generic/Prefetch"
import { classList, highlight } from "../../utils"
import "./Catalog.scss"


interface DataRow {
    id: string | number
    pid: string | number | null
    [key: string]: string | number | boolean | null
}

function search(data: DataRow[], q: string, columns: string[]): DataRow[] {
    if (!q || !columns.length || !data.length) {
        return [...data]
    }

    const input = [...data];
    const out: DataRow[] = [];

    q = q.toLowerCase();

    let i = 0
    do {
        let row = input[i];
        if (columns.some(column => String(row[column]).toLowerCase().includes(q))) {
            row = input.splice(i, 1)[0]
            out.push(row)
            do {
                // eslint-disable-next-line no-loop-func
                const idx = input.findIndex(r => r[MAPPING.id] === row[MAPPING.pid])
                if (idx > -1) {
                    row = input.splice(idx, 1)[0]
                    out.push(row)
                } else {
                    break
                }
            } while (row)
        } else {
            i++
        }
    } while (i < input.length)

    return out
}

export default function Catalog() {
    const [q, setQ] = useState("")
    return <Prefetch path="/api/aggregator/catalog">{(json) => {

        const {
            // stratifier,
            label,
            description
        } = MAPPING

        let data = json
        // if (stratifier) {
        //     data = data.filter(row => {
        //         const value = row[stratifier as keyof typeof row];
        //         return value === undefined || value === null || value === "male"
        //     })
        // }

        if (q) {
            data = search(json, q, [label, description]) as any
        }

        return (
            <div className="catalog">
                <h3 className="mt-0 mb-1 color-blue-dark"><i className="icon fa-solid fa-archive" /> Catalog</h3>
                <div className="mt-1 mb-1 center">
                    <input type="search" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
                </div>
                <Tabs selectedIndex={0}>
                {[
                    {
                        name: "Data Tree",
                        children: <Tree data={data} mapping={MAPPING} search={q} />
                    }, {
                        name: "Data Grid",
                        children: <div className="p-05">
                            <StaticGrid
                                q={q}
                                columns={[
                                    {
                                        name      : MAPPING.label,
                                        label     : "Display",
                                        searchable: true,
                                        type      : "string",
                                    },
                                    {
                                        name : MAPPING.count,
                                        label: "Count",
                                        type : "number",
                                        value(row: DataRow) {
                                            return Number(row[MAPPING.count]).toLocaleString()
                                        },
                                    },
                                    MAPPING.stratifier ? {
                                        name      : MAPPING.stratifier,
                                        label     : MAPPING.stratifier,
                                        type      : "string",
                                    } : false,
                                    {
                                        name      : MAPPING.description,
                                        label     : "Description",
                                        type      : "string",
                                        searchable: true,
                                    }
                                ].filter(Boolean) as any}
                                rows={data}
                                groupBy={MAPPING.stratifier}
                                groupLabel={value => `${MAPPING.stratifier} = ${value}`}
                                // maxHeight={"calc(100% - 20.22rem)"}
                                // height={"calc(100% - 3.22rem)"} // exclude search-bar height
                            />
                        </div>
                    }, {
                        name: "Data Graph",
                        children: <div style={{ padding: 1 }}>
                            <CatalogChart data={data} search={q} />
                        </div>
                    }
                ]}
                </Tabs>
            </div>
        )
    }}</Prefetch>
}

function Tree({
    data,
    mapping,
    search
}: {
    data: DataRow[]
    mapping: DataMapping
    search?: string
})
{
    const { id, pid, stratifier } = mapping
    
    let children = data.filter(row => row[pid] === null)
    if (stratifier) {
        children = children.filter(row => row[stratifier] === null)
    }

    return (
        <div className="catalog-tree">
            <div>
                { children.map((row, i) => (
                    <Row data={data} id={row[id] as  string | number} key={i} mapping={mapping} search={search} open />
                )) }
            </div>
        </div>
    )
}

function Row({
    id,
    data,
    mapping,
    open,
    search
}: {
    data: DataRow[]
    id: string | number
    mapping: DataMapping
    open?: boolean
    search?: string
}) {
    const [isOpen, setIsOpen] = useState(!!open)
    const { id: idColumn, pid: pidColumn, label, count, description, stratifier } = mapping
    const node = data.find(row => row[idColumn] === id)!
    
    let children = data.filter(row => row[pidColumn] === node[idColumn])
    let tooltip: string | undefined;
    if (stratifier) {
        const siblings = data.filter(row => row[pidColumn] === node[pidColumn] && row[idColumn] !== node[idColumn] && row[stratifier] !== null && row[label] === node[label]);
        tooltip = siblings.map(row => `${row[stratifier]}: ${Number(row[count]).toLocaleString()}`).join('<br/>')
        children = children.filter(row => row[stratifier] === null)
    }

    return (
        <details open={isOpen} onToggle={e => {
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
            { isOpen && children.map((row, i) => (
                <Row data={data} id={row[idColumn] as string | number} key={i} mapping={mapping} search={search} />
            ))}
        </details>
    )
}