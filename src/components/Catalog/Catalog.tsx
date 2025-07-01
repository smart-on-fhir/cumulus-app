import { startTransition, useCallback, useEffect, useMemo, useOptimistic, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import CatalogChart   from "./Chart"
import MAPPING        from "./DataMapping"
import CatalogGrid    from "./Grid"
import Tree           from "./Tree"
import { Tabs }       from "../generic/Tabs"
import { CheckBox }   from "../generic/PropertyGrid/BooleanEditor"
import Loader         from "../generic/Loader"
import { AlertError } from "../generic/Alert"
import { request }    from "../../backend"
import "./Catalog.scss"


export interface CatalogResponse {
    columns: ColumnDefinition[]
    rows: (string|number|boolean|null)[][]
    sites: SiteDefinition[]
    pkg?: { id: string, targetColumn: string }
}

interface SiteDefinition {
    id       : string
    name     : string
    cnt     : number
    included: boolean
}

interface ColumnDefinition {
    display  : string
    id       : string
    type     : ColumnDataType
    nullable?: boolean
}

type ColumnDataType = "string" | "number" | "boolean"


function getRows(input: CatalogResponse): DataRow[] {
    const out = []

    for (const row of input.rows) {
        const rec = {}
        input.columns.forEach((col, i) => {
            rec[col.id] = row[i]
        })
        out.push(rec)
    }

    return out
}

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

const { label, description } = MAPPING

export default function Catalog({ title = "Catalog", path }: { title?: string, path: string })
{
    const [q      , setQ      ] = useState("")
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error|string|null>(null)
    const [result , setResult ] = useState<CatalogResponse|null>(null)
    const [query  , setQuery  ] = useSearchParams()
    const navigate              = useNavigate()

    const abortController = useMemo(() => new AbortController(), [])

    const load = useCallback(() => {
        return Promise.resolve()
        .then(() => setLoading(true))
        .then(() => {
            let _url = path
            if (query.has("sites")) {
                const p = new URLSearchParams()
                p.set("sites", query.get("sites"))
                _url += "?" + p
            }
            return request<CatalogResponse>(_url, { signal: abortController.signal })
        })
        .then(setResult)
        .catch(setError)
        .finally(() => { setLoading(false) })
    }, [query])

    useEffect(() => { load() }, [path, query])

    useEffect(() => () => abortController.abort(), [ abortController ]);

    function onSiteChange(list: string[]) {
        if (list.length) {
            query.set("sites", list.join(","))
        } else {
            query.delete("sites")
        }
        setQuery(query)
        startTransition(load)
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!result && !loading) {
        return <AlertError>Failed fetching data from { JSON.stringify(path) }</AlertError>
    }

    return (
        <div className="catalog" aria-disabled={!!loading}>
            <div className="catalog-title">
                <h3 className="nowrap mt-0 mb-0 color-blue-dark"><i className="icon fa-solid fa-archive" /> { title } { loading && <Loader msg="" style={{ color: "#8888" }} /> }</h3>
            </div>
            <div className="catalog-search">
                <input type="search" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="catalog-sites">
                <div style={{ display: "inline-block", textAlign: "left" }}>
                    <SitesSelector sites={ result?.sites } onChange={onSiteChange} loading={loading} />
                </div>
            </div>
            
            <Tabs selectedIndex={0}>
            { (() => {
                if (!result) {
                    return [
                        { name: "Data Tree" , children: null },
                        { name: "Data Grid" , children: null },
                        { name: "Data Graph", children: null }
                    ]
                }

                let data = getRows(result)
                if (q) {
                    data = search(data, q, [label, description]) as any
                }

                const onNavigate = (node: any) => {
                    if (result.pkg) {
                        let filter = "filter=" + encodeURIComponent(result.pkg.targetColumn + ":strEq:" + node.id)
                        const sites = query.get("sites")
                        if (sites) {
                            filter += "," + encodeURIComponent("site:matchesCI:" + sites.split(",").join("|"))
                        }
                        navigate({
                            pathname: "/packages/" + result.pkg.id,
                            search: filter
                        })
                    }
                }

                return [
                    {
                        name: "Data Tree",
                        children: <Tree data={data} search={q} navigate={onNavigate} />
                    }, {
                        name: "Data Grid",
                        children: <CatalogGrid data={data} q={q} />
                    }, {
                        name: "Data Graph",
                        children: <CatalogChart data={data} search={q} navigate={onNavigate} />
                    }
                ]
            })()}
            </Tabs>
        </div>
    )
}

const update = (sites: SiteDefinition[], site: SiteDefinition) => {
        return sites.map(s => {
            if (site.id === s.id) {
                return { ...site }
            }
            return { ...s }
        })
    }

function SitesSelector({
    sites = [],
    onChange,
    loading
}: {
    sites?: SiteDefinition[]
    onChange: (ids: string[]) => void
    loading?: boolean
})
{
    const [optimisticState, onSiteChange] = useOptimistic(sites, update);

    return (
        <>
            { optimisticState.map((site, i) => (
                <label key={i} className="fw-400 mr-2 nowrap unselectable" aria-disabled={!!loading}>
                    <CheckBox
                        disabled={ site.included && optimisticState.filter(s => s.included).length === 1 }
                        checked={ site.included }
                        name={ site.id }
                        onChange={e => {
                            startTransition(() => {
                                const next = { ...site, included: e.target.checked };
                                onSiteChange(next)
                                onChange(update(sites, next).filter(s => !!s.included).map(s => s.id))
                            })
                        }}
                    /> { site.name } <span className="badge bg-brand-2">{ Number(site.cnt).toLocaleString() }</span>
                </label>
            ))}
        </>
    )
}
