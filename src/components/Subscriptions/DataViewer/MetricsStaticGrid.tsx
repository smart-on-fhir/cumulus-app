import { CSSProperties, Fragment, useState } from "react"
import { JSONObject }                        from "../../../types"
import { classList, highlight }              from "../../../utils"
import { CUMULUS_ALL, CUMULUS_NONE }         from "./lib"
import "../../generic/StaticGrid/StaticGrid.scss"


export interface Column {
    /**
     * The property name (as should be found in data rows)
     */
    name: string

    /**
     * Data type - affects sorting and rendering
     */
    type: "number" | "string" | "boolean"

    /**
     * The header label
     */
    label?: string

    searchable?: boolean

    style ?: CSSProperties

    render?: (row: any, c: Column, search?: string) => JSX.Element

    value?: (row: any, c: Column) => any
}

interface MetricsStaticGridProps<T = JSONObject> {
    
    /**
     * Column definitions for the Grid
     */
    columns: Column[]

    /**
     * Data rows
     */
    rows: T[]

    /**
     * Is set and not null, this is the name of the property to
     * group by.
     */
    groupBy?: string | null
    stratifyBy: string
    
    rowTitle?: (row: T) => string,
    
    maxHeight        ?: number | string
    minHeight        ?: number | string
    height           ?: number | string
}

function defaultComparator(a: any, b: typeof a): number {
    if (a === null) {
        return Infinity
    }
    if (b === null) {
        return -Infinity
    }
    if (typeof a === "number") {
        return b - a
    }
    return String(b || "").localeCompare(String(a || ""), "en-US", { numeric: true })
}

export default function MetricsStaticGrid({
    columns,
    rows,
    groupBy = null,
    rowTitle,
    maxHeight,
    minHeight,
    height,
    stratifyBy
}: MetricsStaticGridProps) {

    const searchableCols = columns.filter(c => c.searchable === true && c.name !== groupBy)

    const [search     , setSearch    ] = useState("")
    const [sortColumn , setSortColumn] = useState("")
    const [sortDir    , setSortDir   ] = useState<"asc"|"desc">("asc")
    const [groupMap   , setGroupMap  ] = useState<Record<string, boolean>>({})

    function onHeaderClick(colName: string) {
        setSortColumn(colName)
        setSortDir(sortDir === "desc" ? "asc" : "desc")
    }

    const prepareData = () => {

        // Copy
        // ---------------------------------------------------------------------
        let _rows = [...rows];

        // Sort
        // ---------------------------------------------------------------------
        if (sortColumn) {
            _rows.sort((a, b) => {
                let _a = a[sortColumn]
                let _b = b[sortColumn]
                // if (_a === CUMULUS_ALL && sortColumn === stratifyBy) {
                //     _a = a[groupBy]
                // }
                // if (_b === CUMULUS_ALL && sortColumn === stratifyBy) {
                //     _b = b[groupBy]
                // }
                if (_a === CUMULUS_NONE) return  Infinity
                if (_b === CUMULUS_NONE) return -Infinity
                if (_a === CUMULUS_ALL ) return  Infinity
                if (_b === CUMULUS_ALL ) return -Infinity
                return defaultComparator(_a, _b) * (sortDir === "asc" ? -1 : 1)
            })
        }

        // Group
        // ---------------------------------------------------------------------
        let groups: { groupRow: Record<string, any>; children: any[] }[] = _rows
            .filter(r => r[stratifyBy] === CUMULUS_ALL)
            .map(groupRow => ({
                groupRow,
                children: _rows.filter(r => r[stratifyBy] !== CUMULUS_ALL && r[groupBy] === groupRow[groupBy])
            }));
        
        // Search
        // ---------------------------------------------------------------------
        if (search) {
            groups = groups.filter(group => {
                group.children = group.children.filter(row => {
                    return searchableCols.some(c => {
                        if (row[c.name] === CUMULUS_ALL || row[c.name] === CUMULUS_NONE) {
                            return false
                        }
                        let val = c.value ? c.value(row, c) : row[c.name];
                        return String(val).toLowerCase().includes(search.toLowerCase())
                    })
                })
                return group.children.length > 0
            })
        }

        return groups
    }

    const renderHeader = () => {
        return (
            <thead>
                <tr>
                    { columns.map((c, i) => (
                        <th
                            key={"header-" + i}
                            onMouseDown={() => onHeaderClick(c.name)}
                            className={sortColumn === c.name ? "sorted" : ""}
                            title={ c.label && c.label !== c.name ? `Original column name: "${c.name}"` : undefined }
                        >
                            { c.label ?? c.name } {
                            sortColumn === c.name ?
                                sortDir === "asc" ? <i className="fas icon fa-angle-up"/> : <i className="fas icon fa-angle-down"/> :
                                ""
                            }
                        </th>
                    )) }
                </tr>
            </thead>
        )
    }

    const renderBody = () => {
        const groups = prepareData()

        const colLength = columns.length

        if (!groups.length) {
            return (
                <tbody>
                    <tr>
                        <td className="no-data" colSpan={colLength}>
                            No data! {
                                search && <> Try to <b className="link" onClick={() => setSearch("")}>clear search</b>.</>
                            }
                        </td>
                    </tr>
                </tbody>
            )
        }

        if (groupBy) {
            return (
                <tbody>
                    { groups.map(({ groupRow, children }, i) => {

                        const label = groupRow[groupBy]

                        
                        let kids = children.filter(r => r[stratifyBy] !== null)
                        
                        return (
                            <Fragment key={label}>
                                <tr className={classList({
                                    "group-header-row": true,
                                    open: groupMap[label] !== false,
                                    summary: label === CUMULUS_ALL
                                })}>
                                    { Object.keys(groupRow).map((name, i) => {
                                        if (name === groupBy) {
                                            const count = rows.filter(r => (r[groupBy] === groupRow[groupBy] && r[stratifyBy] !== null)).length - 1
                                            return <td
                                                key={i}
                                                colSpan={2}
                                                className={ classList({
                                                    "group-header": true,
                                                    closed: groupMap[label] === false,
                                                    opened: groupMap[label] !== false,
                                                }) }
                                                onClick={label === CUMULUS_ALL ? undefined : () => setGroupMap({ ...groupMap, [label]: groupMap[label] === false ? true : false })}
                                            >
                                                {
                                                    label === CUMULUS_ALL ?
                                                        <i className="fas icon fa-calculator"/> :
                                                        groupMap[label] === false ?
                                                            <i className="fas icon fa-angle-right"/> :
                                                            <i className="fas icon fa-angle-down"/>
                                                } { cellValue(groupRow, name, true) } { count > 1 && <b className="badge">{ count }</b> }
                                            </td>
                                        }
                                        if (name === stratifyBy) {
                                            return null
                                        }
                                        return <td key={i}>{ cellValue(groupRow, name, true) }</td>
                                    }) }
                                </tr>
                                {
                                    groupMap[label] !== false && label !== CUMULUS_ALL ?
                                        kids.length > 0 ?
                                            kids.map(renderRow) :
                                            <tr>
                                                <td colSpan={colLength}>
                                                    <span style={{
                                                        fontFamily: "monospace",
                                                        fontSize: "1.2em",
                                                        lineHeight: "1.1em",
                                                        margin: "-2px 5px -2px 0",
                                                        verticalAlign: "top",
                                                        color: "#0002",
                                                        userSelect: "none"
                                                    }}>└─</span><i className="color-muted">No Items</i>
                                                </td>
                                            </tr> :
                                        null
                                }
                            </Fragment>
                        )
                    })}
                </tbody>
            )
        }
    }

    const cellValue = (row: any, col: string, isHeaderRow = false) => {
        let value: any = row[col] + "";

        if (value === CUMULUS_ALL) {
            return isHeaderRow ? "ALL" : <i className="color-muted">ALL</i>
        }

        if (value === CUMULUS_NONE) {
            return <i className="color-muted">No known {stratifyBy}</i>
        }

        if (col === groupBy) {
            return isHeaderRow ? <b>{ value + "" }</b> : null
        }

        const meta = columns.find(c => c.name === col)

        if (search && meta?.searchable && typeof value === "string") {
            return value.includes(search) ?
                highlight(value + "", search) :
                meta?.type === "number" ? Number(value).toLocaleString() : value
        }

        return meta?.type === "number" ? Number(value).toLocaleString() : value
    }

    const renderRow = (rec: any, i: number, all: any[]) => {
        return <tr
            key={i}
            data-tooltip={ rowTitle ? rowTitle(rec) : undefined }
            data-tooltip-position="center bottom">
            { columns.map((c, i2) => {
                if (c.name === groupBy) {
                    return null
                }
                if (c.name === stratifyBy) {
                    return <td key={i2} colSpan={2}>
                        <span style={{
                            fontFamily: "monospace",
                            fontSize  : "1.2em",
                            lineHeight: "1.1em",
                            margin    : "-2px 5px -2px 0",
                            verticalAlign: "top",
                            color     : "#0002",
                            userSelect: "none"
                        }}>{ i < all.length - 1 ? "├─" : "└─" }</span>{ cellValue(rec, c.name, true) }
                    </td>
                }
                return <td key={"cell-" + i2} style={c.style}>{ cellValue(rec, c.name) }</td>
            })}
        </tr>
    }

    const renderSearch = () => {
        
        if (!searchableCols.length) {
            return null
        }

        const title = "Search " + searchableCols.map(c => c.label || c.name).join(", ")

        return (
            <div className="mb-1 center">
                <input
                    type="search"
                    placeholder="Search"
                    value={ search }
                    onChange={ e => setSearch(e.target.value) }
                    data-tooltip={ title }
                    data-tooltip-position="center bottom"
                />
            </div>
        )
    }

    return (
        <>
            { renderSearch() }
            <div className={classList({
                "static-grid-wrapper": true,
                "grouped": !!groupBy,
                "searchable": searchableCols.length > 0
             })} style={{ maxHeight, minHeight, height }}>
                <table className="static-grid-table">
                    { renderHeader() }
                    { renderBody() }
                </table>
            </div>
        </>
    )
}
