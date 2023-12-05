import { CSSProperties, useState } from "react"
import "./StaticGrid.scss"


interface Column {
    name   : string
    type   : "number" | "string" | "boolean"
    label ?: string
    style ?: CSSProperties
    render?: (row: any, c: Column) => JSX.Element
}


export default function StaticGrid({
    columns,
    rows,
    selectBy,
    selection = [],
    onSelectionChange,
    rowTitle,
    maxHeight,
    minHeight,
    height
}: {
    columns           : Column[]
    rows              : Record<string, any>[]
    selectBy          : string | null
    selection        ?: any[]
    onSelectionChange?: (selection: any[]) => void
    rowTitle         ?: (row: any) => string,
    maxHeight        ?: number | string
    minHeight        ?: number | string
    height           ?: number | string
}) {

    const [sortColumn, setSortColumn] = useState("")
    const [sortDir   , setSortDir   ] = useState<"asc"|"desc">("asc")
    const [recs      , setRecs      ] = useState<Record<string, any>[]>(rows)

    function onHeaderClick(colName: string) {
        const col = columns.find(c => c.name === colName)!
        setSortColumn(colName)
        setSortDir(sortDir === "desc" ? "asc" : "desc")
        setRecs([...rows].sort((a: any, b: any) => {
            if (col.type === "number") {
                return (b[colName] - a[colName]) * (sortDir === "asc" ? -1 : 1)
            }
            return String(b[colName] || "").localeCompare(String(a[colName] || "")) * (sortDir === "asc" ? 1 : -1)
        }))
    }

    return (
        <div className="static-grid-wrapper" style={{ maxHeight, minHeight, height }}>
            <table className="static-grid-table">
                <thead>
                    <tr>
                        { selectBy && <th style={{ width: "2em" }}></th> }
                        { columns.map((c, i) => (
                            <th
                                key={i}
                                style={c.style}
                                onMouseDown={() => onHeaderClick(c.name)}
                                className={sortColumn === c.name ? "sorted" : ""}
                            >
                                { c.label ?? c.name } {
                                sortColumn === c.name ?
                                    sortDir === "asc" ?
                                        <i className="fas icon fa-angle-up"/> :
                                        <i className="fas icon fa-angle-down"/> :
                                    ""
                                }
                            </th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { recs.map(u => {
                        const selected = !!(selectBy && selection.includes(u[selectBy]))
                        return <tr
                            key={u.id}
                            className={ selected ? "selected" : undefined }
                            data-tooltip={ rowTitle ? rowTitle(u) : undefined } >
                            { selectBy && onSelectionChange && <td>
                                <input type="checkbox" checked={selected} onChange={e => {
                                    if (e.target.checked) {
                                        onSelectionChange([...selection, u[selectBy]])
                                    } else {
                                        onSelectionChange([...selection].filter(x => x !== u[selectBy]))
                                    }
                                }} />
                            </td> }
                            { columns.map((c, i) => (
                                <td key={i}>{ c.render ? c.render(u, c) : u[c.name] + "" }</td>
                            )) }
                        </tr>
                    }) }
                </tbody>
            </table>
        </div>
    )
}