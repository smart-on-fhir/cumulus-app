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

    render?: (row: any, c: Column) => JSX.Element

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
}

function createComparator(type: string, sortDir: "asc" | "desc", getValue?: (row: any) => any) {
    return (a: any, b: any) => {
        const _a = getValue ? getValue(a) : a
        const _b = getValue ? getValue(b) : b
        if (type === "number") {
            return (_b - _a) * (sortDir === "asc" ? -1 : 1)
        }
        return String(_b || "").localeCompare(String(_a || ""), "en-US", { numeric: true }) * (sortDir === "asc" ? 1 : -1)
    }
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
    filter = () => true
}: StaticGridProps) {

    const searchableCols = columns.filter(c => c.searchable === true && c.name !== groupBy)

    const [search    , setSearch    ] = useState("")
    const [sortColumn, setSortColumn] = useState("")
    const [sortDir   , setSortDir   ] = useState<"asc"|"desc">("asc")
    const [groupMap  , setGroupMap  ] = useState<Record<string, boolean>>({})

    function onHeaderClick(colName: string) {
        setSortColumn(colName)
        setSortDir(sortDir === "desc" ? "asc" : "desc")
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
        if (search) {
            for (let groupLabel in groups) {
                groups[groupLabel] = groups[groupLabel].filter(row => {
                    return searchableCols.some(c => {
                        let val = c.value ? c.value(row, c) : row[c.name];
                        return String(val).toLowerCase().includes(search.toLowerCase())
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
        const keys = Object.keys(groups).sort(createComparator("string", "desc"))
        if (sortColumn) {
            const col = columns.find(c => c.name === sortColumn)!
            const comparator = createComparator(col.type, sortDir, row => row[sortColumn])
            keys.forEach(groupLabel => {
                out.set(groupLabel, groups[groupLabel].sort(comparator))
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
                    { Array.from(groups.entries()).map(([label, children], i) => {

                        let headerCells = [];
                        
                        const headerValues = groupLabel ?
                            groupLabel(
                                label,
                                // groups[label],
                                // rows,
                                children,
                                search
                            ) :
                            highlight(label + "", search);

                            

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

                        if (!childRows.length) {
                            return null
                        }

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
                                                    No Items
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

        return (
            <tbody>
                { groups.get("__ALL__")!.filter(filter).map((u, i) => renderRow(u, "row--" + i)) }
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
                    c.render(rec, c) :
                    c.value ?
                        c.value(rec, c) + "" : 
                        rec[c.name] + "";
                if (search && c.searchable && (typeof value === "string" || typeof value === "number")) {
                    value = <div>{ highlight(value + "", search) }</div>
                }
                return <td key={"cell-" + i} style={c.style}>{ value }</td>
            }) }
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
