import { CSSProperties }      from "react"
import StaticGrid             from "../../generic/StaticGrid"
import { app }                from "../../../types"
import { humanizeColumnName } from "../../../utils"


function getStyleForColumn(col: app.DataRequestDataColumn) {
    const style: CSSProperties = { color: "#333" }

    if (col.dataType === "float" || col.dataType === "integer") {
        style.color = "#009"
    }

    if (col.dataType.startsWith("date")) {
        style.color = "#060"
    }

    if (col.dataType === "boolean") {
        style.color = "#909"
    }
    
    return style
}

export default function FlatGrid({
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
            style: getStyleForColumn(c),
            value(row) {
                return (c.dataType === "float" || c.dataType === "integer") ?
                    Number(row[c.name]).toLocaleString() :
                    String(row[c.name])
            },
            type: c.dataType === "boolean" ?
                "boolean" :
                (c.dataType === "float" || c.dataType === "integer") ?
                    "number" :
                    "string"
        }))}
        rows={rows}
        height={"calc(100% - 3.23rem)"} // exclude search-bar height
    />
}
