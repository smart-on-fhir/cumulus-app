import { DataRow } from "./Catalog"
import MAPPING     from "./DataMapping"
import StaticGrid  from "../generic/StaticGrid"


export default function Grid({ q = "", data }: { q?: string, data: DataRow[] }) {
    return (
        <div className="p-05" style={{ display: "contents" }}>
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
    )
}