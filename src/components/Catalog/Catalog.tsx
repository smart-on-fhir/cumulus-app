import { useState } from "react"
import CatalogChart from "./Chart"
import MAPPING      from "./DataMapping"
import Grid         from "./Grid"
import Tree         from "./Tree"
import { Tabs }     from "../generic/Tabs"
import "./Catalog.scss"


export interface DataRow {
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

export default function Catalog({ title = "Catalog", json }: { title?: string, json: DataRow[] }) {
    const [q, setQ] = useState("")
    
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
            <h3 className="mt-0 mb-1 color-blue-dark"><i className="icon fa-solid fa-archive" /> { title }</h3>
            <div className="mt-1 mb-1 center">
                <input type="search" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Tabs selectedIndex={0}>
            {[
                {
                    name: "Data Tree",
                    children: <Tree data={data} search={q} />
                }, {
                    name: "Data Grid",
                    children: <Grid data={data} q={q} />
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
}
