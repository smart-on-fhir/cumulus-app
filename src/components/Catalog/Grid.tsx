import { DataRow }   from "./Catalog"
import MAPPING       from "./DataMapping"
import StaticGrid    from "../generic/StaticGrid"
import { highlight } from "../../utils"


const { id, pid, count, label, description } = MAPPING

export default function Grid({ q = "", data, navigate }: { q?: string, data: DataRow[], navigate?: (...args: any[]) => void }) {
    return (
        <div className="p-05" style={{ display: "contents" }}>
            <StaticGrid
                q={q}
                columns={[
                    {
                        name      : label,
                        label     : "Display",
                        searchable: true,
                        type      : "string",
                    },
                    {
                        name : count,
                        label: "Count",
                        type : "number",
                        value(row: DataRow) {
                            return Number(row[count]).toLocaleString()
                        },
                    },
                    {
                        name      : description,
                        label     : "Description",
                        type      : "string",
                        searchable: true,
                        render(row, col, search) {
                            const txt = search ? highlight(row[description], search) : row[description];
                            if (navigate && !data.filter(node => node[pid] === row[id]).length) {
                                return <span className="color-blue-dark link" onClick={() => navigate(row)}>{txt}</span>
                            }
                            return txt
                        }
                    }
                ].filter(Boolean) as any}
                rows={data}
                // groupBy={MAPPING.stratifier}
                // groupLabel={value => `${MAPPING.stratifier} = ${value}`}
                // maxHeight={"calc(100% - 20.22rem)"}
                // height={"calc(100% - 3.22rem)"} // exclude search-bar height
            />
        </div>
    )
}