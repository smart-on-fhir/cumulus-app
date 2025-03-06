import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams }         from "react-router-dom"
import Loader                                         from "../generic/Loader"
import { MarkdownPreview }                            from "../SubscriptionGroups/List"
import { request }                                    from "../../backend"
import { highlight }                                  from "../../utils"
import "./Search.scss"


interface SearchResult {
    name       : string
    description: string | null
    id         : number | string
    type       : "Data Source"|"Graph"|"Data Source Group"|"Tag"|"Study Area"|"Data Package"
    study     ?: string
    version   ?: string
}

interface SearchResponse {
    results: SearchResult[]
    total: number
}

export default function Search()
{
    const navigate = useNavigate()
    const [q, setQ] = useState("")
    const [result, setResult] = useState<SearchResponse|null>(null)
    const [loading, setLoading] = useState(false)
    const wrapper = useRef<HTMLDivElement>(null)

    async function doSearch(txt: string) {
        setQ(txt)
        setLoading(true)
        if (txt) {
            const result = await request<SearchResponse>(`/api/search?q=${encodeURIComponent(txt)}&limit=100`)
            setResult(result)
        } else {
            setResult(null)
        }
        setLoading(false)
    }

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const links = Array.from(wrapper.current!.querySelectorAll("a"))
        const currentIndex = links.findIndex(el => el.classList.contains("active"))
        switch (e.key) {
            case "ArrowDown": {
                e.preventDefault()
                links[currentIndex]?.classList.remove("active")
                const next = links[currentIndex + 1] || links[0];
                next?.classList.add("active")
                next?.scrollIntoView({ block: "nearest", behavior: "auto" })
                break;
            }
            case "ArrowUp": {
                e.preventDefault()
                links[currentIndex]?.classList.remove("active")
                const next = links[currentIndex - 1] || links[links.length - 1];
                next?.classList.add("active")
                next?.scrollIntoView({ block: "nearest", behavior: "auto" })
                break;
            }
            case "Escape":
                e.preventDefault();
                closeMenu();
                break;
            case "Enter":
                e.preventDefault();
                links[currentIndex] ?
                    links[currentIndex].click() : 
                    navigate("/search?q=" + encodeURIComponent(q));
                closeMenu();
                break;
            default:
                break;
        }
    }

    function closeMenu() {
        wrapper.current?.querySelectorAll("a.active").forEach(l => l.classList.remove("active"));
        wrapper.current?.querySelector<HTMLInputElement>('input[type="search"]')?.blur();
    }

    return (
        <div className={"global-search" + (loading ? " loading" : "")} tabIndex={0} onKeyDown={onKeyDown} ref={wrapper}>
            <input type="search" placeholder="Search" value={q} onChange={e => doSearch(e.target.value)} />
            { result?.results && result.results.length > 0 && <div className="global-search-results">
                { result.results.map((r, i) => <Match result={r} search={q} key={i}/> )}
                { result.total > result.results.length && <>
                    <hr/>
                    <Link to={"/search?q=" + encodeURIComponent(q)} className="center" tabIndex={0}>
                        <small>Showing {result.results.length} of {result.total} results.</small><br />
                        <b className="color-blue-dark">See All</b>
                    </Link>
                </> }
            </div> }
            <i className="fas fa-circle-notch fa-spin loader"/>
        </div>
    )
}

function Match({ result, search }: { result: SearchResult, search: string }) {
    return (
        <Link to={ getHref(result) } className="name color-blue-dark">
            <Icon type={result.type} />
            <span className="name color-blue-dark">{highlight(result.name, search)}</span>
            <div className="small color-muted color-brand-2">
                {result.study ?
                    <span><b>{result.type}</b>: {result.study} / {result.id}</span> :
                    <span><b>{result.type}</b> #{result.id}</span>
                }
            </div>
            { result.description && <div className="color-muted small description">
                <MarkdownPreview markdown={result.description || ""} maxLen={500} />
            </div> }
        </Link>
    )
}

function getHref(result: SearchResult) {
    switch (result.type) {
        case "Data Source":
            return `/requests/${result.id}`;
        case "Data Source Group":
            return `/groups/${result.id}`;
        case "Graph":
            return `/views/${result.id}`;
        case "Study Area":
            return `/study-areas/${result.id}`;
        case "Tag":
            return `/tags/${result.id}`;
        case "Data Package":
            return `/explorer?path=${encodeURIComponent(`/studies/${result.study}/${result.version}/${result.id}`)}`;
        default:
            return ""
    }
}

function Icon({ type }: { type: SearchResult["type"] }) {
    switch (type) {
        case "Graph":
            return <i className="icon fa-solid fa-chart-pie color-muted" />
        case "Study Area":
            return <i className="icon fa-solid fa-book color-muted" />
        case "Data Source":
            return <i className="icon fa-solid fa-database color-muted" />
        case "Data Source Group":
            return <i className="icon fa-solid fa-folder color-muted" />
        case "Tag":
            return <i className="icon fa-solid fa-tag color-muted" />
        case "Data Package":
            return <i className="icon fa-solid fa-cube color-muted" />
        default:
            return null
    }
}

export function SearchResultsPage()
{
    const [params] = useSearchParams()
    const q = params.get("q") || ""
    const [result, setResult] = useState<SearchResponse|null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | string | null>(null)

    useEffect(() => {
        if (q) {
            setLoading(true)
            setError(null)
            request<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`)
                .then(setResult)
                .catch(setError)
                .finally(() => setLoading(false))

        } else {
            setLoading(false)
            setError(null)
            setResult(null)
        }
    }, [q])
    
    if (loading) {
        return <div className="container global-search-results loading"><Loader /></div>
    }

    if (error) {
        return <div className="container global-search-results color-red">{ error + "" }</div>
    }

    return (
        <div className="container global-search-results">
            <h1>Search Results for "{q}"</h1>
            <hr className="mb-4" />
            { result?.results && result.results.length > 0 ?
                result.results.map((r, i) => <Match result={r} search={q} key={i}/> ) :
                "No Results"
            }
        </div>
    )
}
