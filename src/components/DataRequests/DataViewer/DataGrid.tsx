import { CUMULUS_ALL, CUMULUS_NONE }     from "./lib"
import StaticGrid                        from "../../generic/StaticGrid"
import { app }                           from "../../../types"
import { highlight, humanizeColumnName } from "../../../utils"


export default function DataGrid({
    cols,
    rows,
    groupBy,
    stratifyBy
}: {
    cols: app.DataRequestDataColumn[]
    rows: Record<string, any>[]
    groupBy: string
    stratifyBy: string
})
{
    return <StaticGrid
        columns={cols.map(c => ({
            name: c.name,
            label: humanizeColumnName(c.name),
            searchable: true,
            value(row) {
                return (c.dataType === "float" || c.dataType === "integer") ?
                    Number(row[c.name]).toLocaleString() :
                    String(row[c.name])
            },
            type: c.dataType === "boolean" ?
                "boolean" :
                (c.dataType === "float" || c.dataType === "integer") ?
                    "number" :
                    "string",
            render(row, col, search) {
                const strValue = (c.dataType === "float" || c.dataType === "integer") ?
                    Number(row[c.name]).toLocaleString() :
                    String(row[c.name]);
                if (strValue === CUMULUS_NONE) {
                    return <i className="color-muted">No known {stratifyBy}</i>
                }
                return <>{ highlight(strValue, search) }</>
            }
        }))}
        rows={rows.filter(row => row[groupBy] !== CUMULUS_ALL)}
        groupBy={groupBy}
        height={"calc(100% - 3.22rem)"} // exclude search-bar height
        // Filter out the group meta rows and placeholder rows
        filter={ row => row[stratifyBy] !== CUMULUS_ALL && row[stratifyBy] !== null}
        groupLabel={(value, children, search) => {
            const allRow = children.find(r => r[groupBy] === value && r?.[stratifyBy] === CUMULUS_ALL)
            if (allRow) {
                return Object.keys(allRow).filter(k => k !== stratifyBy).map(k => {
                    const col = cols.find(c => c.name === k)
                    return col?.dataType === "float" || col?.dataType === "integer" ?
                        highlight(Number(allRow[k]).toLocaleString(), search) :
                        highlight(allRow[k], search)
                })
            }
            return value
        }}
        comparator={(a, b) => {
            if (a === CUMULUS_NONE) return Infinity
            if (b === CUMULUS_NONE) return -Infinity
            if (a === CUMULUS_ALL) return -Infinity
            if (b === CUMULUS_ALL) return Infinity
            return 0
        }}
    />
}
