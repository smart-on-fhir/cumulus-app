import { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { classList } from "../../utils";
import Checkbox from "../generic/Checkbox";
import MenuButton from "../generic/MenuButton";
import ViewsBrowser from "./ViewsBrowser";


type SortType = "name-asc" | "name-desc" | "mod-asc" | "mod-desc" | ""
type ViewType = "grid" | "column" | "list"
type GroupBy  = "tag" | "subscription" | ""

export default function Views({ drafts }: { drafts?: boolean })
{
    const url = new URL(window.location.href)

    const [ viewType, setViewType ] = useState<ViewType>(String(url.searchParams.get("view") || "grid") as ViewType)
    const [ search  , setSearch   ] = useState(url.searchParams.get("q") || "")
    const [ groupBy , setGroupBy  ] = useState<GroupBy>(String(url.searchParams.get("group") || "") as GroupBy)
    const [ sort    , setSort     ] = useState<SortType>(String(url.searchParams.get("sort") || "") as SortType)
    const [ starOnly, setStarOnly ] = useState<Boolean>(url.searchParams.get("star") === "1")

    const draftsMode = drafts ?? !!url.searchParams.get("drafts")

    const onSearch = (q: string) => {
        url.searchParams.set("q", q)
        window.history.replaceState(null, "", url.href)
        setSearch(q)
    };

    const onSetViewType = (t: "grid" | "column" | "list") => {
        url.searchParams.set("view", t)
        window.history.replaceState(null, "", url.href)
        setViewType(t)
    };

    const toggleStar = () => {
        if (starOnly) {
            url.searchParams.delete("star")
        } else {
            url.searchParams.set("star", "1")
        }
        window.history.replaceState(null, "", url.href)
        setStarOnly(!starOnly)
    };

    const onSetGroupBy = (t: "subscription" | "tag" | "") => {
        if (!t) {
            url.searchParams.delete("group")
        } else {
            url.searchParams.set("group", t)
        }
        window.history.replaceState(null, "", url.href)
        setGroupBy(t)
    };

    const onSetSort = (t: SortType) => {
        if (!t) {
            url.searchParams.delete("sort")
        } else {
            url.searchParams.set("sort", t)
        }
        window.history.replaceState(null, "", url.href)
        setSort(t)
    };

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>{ draftsMode ? "Draft Graphs" : "Cumulus Graphs" }</title>
                </Helmet>
            </HelmetProvider>
            <header className="view-browser-header">
                <div className="row half-gap middle wrap">
                    <div className="col col-0 mb-05 nowrap">
                        { draftsMode ? 
                            <h4 className="m-0">
                                <i className="icon fa-solid fa-pen-to-square color-brand-2" /> My Draft Graphs
                            </h4> :
                            <h4 className="m-0">
                                <i className="icon fa-solid fa-chart-pie color-brand-2" /> Graphs
                            </h4>
                        }
                    </div>
                    <div className="col col-0 responsive"/>
                    <div className="col col-3 mb-05 right responsive">
                        <input
                            type="search"
                            placeholder="Search Graphs by Name"
                            value={search}
                            onChange={e => onSearch(e.target.value)}
                        />
                    </div>
                    {/* <div className="col col-0 responsive"/> */}
                    <div className="col col-4 mb-05 nowrap responsive right">
                        <div className="row">
                            <button className="btn btn-virtual" data-tooltip="Toggle show starred only" onClick={toggleStar}>
                                { starOnly ? <i className="fa-solid fa-star color-brand-2" /> : <i className="fa-regular fa-star color-muted" /> }
                            </button>
                            <MenuButton right title="Sort By" items={[
                                <Checkbox onChange={() => onSetSort("name-asc"   )} checked={ sort === "name-asc"   } name="sort" type="radio" label={<>Sort by Name <span className="color-muted">(A-Z)</span></>} />,
                                <Checkbox onChange={() => onSetSort("name-desc"  )} checked={ sort === "name-desc"  } name="sort" type="radio" label={<>Sort by Name <span className="color-muted">(Z-A)</span></>} />,
                                "separator",
                                <Checkbox onChange={() => onSetSort("mod-desc"   )} checked={ sort === "mod-desc"   } name="sort" type="radio" label={<>Sort by Date <span className="color-muted">(newest first)</span></>} />,
                                <Checkbox onChange={() => onSetSort("mod-asc"    )} checked={ sort === "mod-asc"    } name="sort" type="radio" label={<>Sort by Date <span className="color-muted">(oldest first)</span></>} />,
                                "separator",
                                <Checkbox onChange={() => onSetSort("")} checked={ !sort } name="sort" type="radio" label={ <><b>Default Sort</b> <span className="color-muted">(name, date)</span></> } />
                            ]}>
                                <i className={ classList({
                                    "material-symbols-rounded": true,
                                    "color-brand-2": !!sort
                                }) }>sort_by_alpha</i> Sort
                                <span className="color-muted"> ▾</span>
                            </MenuButton>
                            <MenuButton right title="Group By" items={[
                                <Checkbox
                                    onChange={() => onSetGroupBy("subscription")}
                                    checked={ groupBy === "subscription"}
                                    name="groupBy"
                                    type="radio"
                                    label="Group by Subscription"
                                />,
                                <Checkbox
                                    onChange={() => onSetGroupBy("tag")}
                                    checked={ groupBy === "tag"}
                                    name="groupBy"
                                    type="radio"
                                    label="Group by Tag"
                                />,
                                "separator",
                                <Checkbox
                                    onChange={() => onSetGroupBy("")}
                                    checked={ !groupBy }
                                    name="groupBy"
                                    type="radio"
                                    label={ <b>No Grouping</b> }
                                />
                            ]}>
                                <i className={ classList({
                                    "material-symbols-rounded": true,
                                    "color-brand-2": !!groupBy
                                })}>layers</i> Group
                                <span className="color-muted"> ▾</span>                            
                            </MenuButton>
                        </div>
                    </div>
                    <div className="col col-0 mb-05">
                        <div className="toolbar flex">
                            <button
                                className={"btn" + (viewType === "grid" ? " active" : "")}
                                onClick={() => onSetViewType("grid")}
                                title="Grid View"
                            ><i className="material-symbols-rounded">grid_view</i></button>
                            <button
                                className={"btn" + (viewType === "column" ? " active" : "")}
                                onClick={() => onSetViewType("column")}
                                title="Column View"
                                ><i className="material-symbols-rounded">view_week</i></button>
                            <button
                                className={"btn" + (viewType === "list" ? " active" : "")}
                                onClick={() => onSetViewType("list")}
                                title="List View"
                                ><i className="material-symbols-rounded">table_rows</i>
                                </button>
                            
                        </div>    
                    </div>
                </div>
                <hr className="mt-05 mb-1"/>
            </header>
            <ViewsBrowser
                layout={ viewType || "grid" }
                search={search}
                sort={sort}
                groupBy={groupBy}
                drafts={draftsMode}
                starOnly={!!starOnly}
            />
        </div>
    )
}