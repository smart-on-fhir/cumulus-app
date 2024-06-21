import { CUMULUS_ALL, CUMULUS_NONE }     from "./lib"
import StaticGrid                        from "../../generic/StaticGrid"
import { app }                           from "../../../types"
import { highlight, humanizeColumnName } from "../../../utils"


export default function DataGrid({
    cols,
    rows
}: {
    cols: app.DataRequestDataColumn[]
    rows: Record<string, any>[]
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
                const strValue = String(row[col.name])
                if (strValue === CUMULUS_NONE) {
                    return <b className="color-muted">{highlight("none", search)}</b>
                }
                return <>{ highlight(strValue, search) }</>
            }
        }))}
        rows={rows}
        groupBy="id"
        height={"calc(100% - 3.22rem)"} // exclude search-bar height
        filter={ row => row.category !== CUMULUS_ALL }
        groupLabel={(value, children, search) => {
            const allRow = children.find(r => r.id === value && r?.category === CUMULUS_ALL)
            if (allRow) {
                return Object.keys(allRow).filter(k => k !== "category").map(k => {
                    const col = cols.find(c => c.name === k)
                    return col?.dataType === "float" || col?.dataType === "integer" ?
                        highlight(Number(allRow[k]).toLocaleString(), search) :
                        highlight(allRow[k], search)
                })
            }
            return value
        }}
    />
}
