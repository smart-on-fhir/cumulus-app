import { CSSProperties, Fragment, useState } from "react"
import { JSONObject, JSONValue }             from "../../../types"
import { classList, highlight }              from "../../../utils"
import "./StaticGrid.scss"


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

interface StaticGridProps<T = JSONObject> {
    
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

    groupLabel?: (value: JSONValue, children: T[], search?: string) => JSX.Element | string
    
    /**
     * List of selected IDs
     */
    selection?: T[]

    equals?: (a: T, b: T) => boolean
    
    onSelectionChange?: (selection: T[]) => void

    selectionType?: "single" | "multiple" | "none",
    
    rowTitle?: (row: T) => string,
    
    maxHeight        ?: number | string
    minHeight        ?: number | string
    height           ?: number | string

    filter?: (row: T, index: number, all: T[]) => boolean

    comparator?: (a: any, b: typeof a) => number

    contains?: (x: any, search: string) => boolean

    q?: string

    defaultLimit?: number
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

export default function StaticGrid({
    columns,
    rows,
    groupBy = null,
    groupLabel,
    selection = [],
    selectionType = "none",
    onSelectionChange,
    rowTitle,
    maxHeight,
    minHeight,
    height,
    equals = (a, b) => a === b,
    comparator,
    filter = () => true,
    contains,
    q,
    defaultLimit = 500
}: StaticGridProps) {

    const searchableCols = columns.filter(c => c.searchable === true && c.name !== groupBy)

    const [limit     , setLimit     ] = useState(defaultLimit)
    const [search    , setSearch    ] = useState("")
    const [sortColumn, setSortColumn] = useState("")
    const [sortDir   , setSortDir   ] = useState<"asc"|"desc">("asc")
    const [groupMap  , setGroupMap  ] = useState<Record<string, boolean>>({})

    const _search = q ?? search

    function onHeaderClick(colName: string) {
        setSortColumn(colName)
        setSortDir(sortDir === "desc" ? "asc" : "desc")
        setLimit(defaultLimit)
    }

    const prepareData = () => {

        // ---------------------------------------------------------------------
        // Start with a copy of the entire input data
        // ---------------------------------------------------------------------
        let _rows = [...rows];


        // ---------------------------------------------------------------------
        // Organize in groups if needed
        // ---------------------------------------------------------------------
        const groups: Record<string, any[]> = {};
        if (groupBy) {
            _rows.forEach(row => {
                let label = row[groupBy];
                let group = groups[label];
                if (!group) {
                    group = groups[label] = [];
                }
                group.push(row)
            });
        } else {
            groups.__ALL__ = _rows;
        }

        // ---------------------------------------------------------------------
        // Apply search and exclude empty groups
        // ---------------------------------------------------------------------
        if (_search) {
            const _q = _search.toLowerCase()
            for (let groupLabel in groups) {
                groups[groupLabel] = groups[groupLabel].filter(row => {
                    return searchableCols.some(c => {
                        let val = c.value ? c.value(row, c) : row[c.name];
                        return contains ?
                            contains(val, _search) :
                            String(val).toLowerCase().includes(_q)
                    })
                })

                if (!groups[groupLabel].length) {
                    delete groups[groupLabel]
                }
            }
        }

        
        // ---------------------------------------------------------------------
        // Sort
        // ---------------------------------------------------------------------
        let out: Map<string, any[]> = new Map()
        const keys = Object.keys(groups).sort((a, b) => defaultComparator(a, b) * (sortDir === "asc" ? -1 : 1))
        if (sortColumn) {
            keys.forEach(groupLabel => {
                out.set(groupLabel, groups[groupLabel].sort((a, b) => {
                    const _a = a[sortColumn]
                    const _b = b[sortColumn]
                    let n = 0

                    // Call the custom comparator if provided
                    if (comparator) {
                        n = comparator(_a, _b)
                    }

                    // If the custom comparator returned 0 call the built-in one too
                    if (n === 0) {
                        n = defaultComparator(_a, _b)
                    }

                    // Unless the result is infinity, respect the sort direction
                    if (isFinite(n)) {
                        return n * (sortDir === "asc" ? -1 : 1)
                    }

                    return n
                }))
            })
        } else {
            keys.forEach(groupLabel => {
                out.set(groupLabel, groups[groupLabel])
            })
        }
        return out
    }

    const renderHeader = () => {
        return (
            <thead>
                <tr>
                    { selectionType !== "none" && <th style={{ width: "1em" }}>
                        { onSelectionChange && selectionType === "multiple" &&
                            <input
                                type="checkbox"
                                checked={ selection.length === rows.length }
                                onChange={e => {
                                    if (e.target.checked) {
                                        onSelectionChange([...rows])
                                    } else {
                                        onSelectionChange([])
                                    }
                                }}
                            />
                        }
                    </th> }
                    { columns.filter(c => c.name !== groupBy).map((c, i) => (
                        <th
                            key={"header-" + i}
                            // style={c.style}
                            onMouseDown={() => onHeaderClick(c.name)}
                            className={sortColumn === c.name ? "sorted" : ""}
                            title={ c.label && c.label !== c.name ? `Original column name: "${c.name}"` : undefined }
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
        )
    }

    const renderBody = () => {
        const groups = prepareData()

        const colLength = columns.length + (selectionType !== "none" && onSelectionChange ? 1: 0)

        if (!groups.size) {
            return (
                <tbody>
                    <tr>
                        <td className="no-data" colSpan={colLength}>
                            No data! {
                                _search && (q ?
                                    <> Try clearing the search parameter.</> :
                                    <> Try to <b className="link" onClick={() => { setSearch(""); setLimit(defaultLimit); }}>clear search</b>.</>
                                )
                            }
                        </td>
                    </tr>
                </tbody>
            )
        }

        if (groupBy) {
            return (
                <tbody>
                    { Array.from(groups.entries()).map(([label, children], i) => {

                        let headerCells = [];
                        
                        const headerValues = groupLabel ?
                            groupLabel(
                                label,
                                children,
                                _search
                            ) :
                            highlight(label + "", _search);

                        if (Array.isArray(headerValues)) {
                            headerCells.push(
                                <td
                                    key={ "group-header-" + label }
                                    className={ "group-header" + (groupMap[label] === false ? " closed": " opened") }
                                    onClick={() => setGroupMap({ ...groupMap, [label]: groupMap[label] === false ? true : false })}
                                >
                                    {
                                        groupMap[label] === false ?
                                            <i className="fas icon fa-angle-right"/> :
                                            <i className="fas icon fa-angle-down"/>
                                    } {headerValues[0]}
                                </td>
                            )

                            for (let i = 1; i < colLength - 1; i++) {
                                headerCells.push(<td key={ "group-header-cell-" + i }>{ headerValues[i] }</td>)
                            }
                        } else {
                            headerCells.push(
                                <td
                                    key={ "group-header-" + label }
                                    colSpan={colLength}
                                    className={ "group-header" + (groupMap[label] === false ? " closed": " opened") }
                                    onClick={() => setGroupMap({ ...groupMap, [label]: groupMap[label] === false ? true : false })}
                                >
                                    {
                                        groupMap[label] === false ?
                                            <i className="fas icon fa-angle-right"/> :
                                            <i className="fas icon fa-angle-down"/>
                                    } {headerValues}
                                </td>
                            )
                        }

                        const childRows = children.filter(filter)

                        return (
                            <Fragment key={label}>
                                <tr className={classList({
                                    "group-header-row": true,
                                    open: groupMap[label] !== false
                                })}>
                                    { headerCells }
                                </tr>
                                {
                                    groupMap[label] !== false ?
                                        childRows.length > 0 ?
                                            // @ts-ignore
                                            childRows.map((u, i) => renderRow(u, label + "-" + i)) :
                                            <tr>
                                                <td colSpan={colLength} className="color-muted">
                                                    <i>No Items</i>
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

        let rows = groups.get("__ALL__")!.filter(filter)
        let remaining = 0
        if (limit && limit < rows.length) {
            remaining = rows.length - limit
            rows = rows.slice(0, limit)
        }

        return (
            <tbody>
                { rows.map((u, i) => renderRow(u, "row--" + i)) }
                { remaining > 0 && <tr>
                    <td colSpan={columns.filter(c => c.name !== groupBy).length} className="center color-red" style={{ padding: 10 }}>
                        { remaining.toLocaleString() } rows not rendered to improve performance.<br/>
                        <b className="link" onClick={() => setLimit(0)}>Load All</b>
                    </td>
                </tr> }
            </tbody>
        )
    }

    const renderRow = (rec: any, key: string | number) => {
        const selected = !!(selectionType !== "none" && !!selection.find(x => equals(x, rec)))
        return <tr
            key={key}
            className={ selected ? "selected" : undefined }
            data-tooltip={ rowTitle ? rowTitle(rec) : undefined }
            data-tooltip-position="center bottom">
            { selectionType !== "none" && onSelectionChange && <td>
                <input
                    type={ selectionType === "single" ? "radio" : "checkbox" }
                    checked={selected}
                    onChange={e => {
                        if (selectionType === "single") {
                            onSelectionChange(e.target.checked ? [rec] : [])
                        } else {
                            if (e.target.checked) {
                                onSelectionChange([...selection, rec])
                            } else {
                                onSelectionChange([...selection].filter(x => !equals(x, rec)))
                            }
                        }
                    }}
                />
            </td> }
            { columns.filter(c => c.name !== groupBy).map((c, i) => {
                let value: any = c.render ?
                    c.render(rec, c, _search) :
                    c.value ?
                        c.value(rec, c) + "" : 
                        rec[c.name] + "";
                if (_search && c.searchable && (typeof value === "string" || typeof value === "number")) {
                    value = <div>{ highlight(value + "", _search) }</div>
                }
                return <td key={"cell-" + i} style={c.style}>{ value }</td>
            }) }
        </tr>
    }

    const renderSearch = () => {
        
        if (q !== undefined || !searchableCols.length) {
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
