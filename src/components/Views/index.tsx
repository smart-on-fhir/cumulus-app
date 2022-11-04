import { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ViewsBrowser from "./ViewsBrowser";

export default function()
{
    const url = new URL(window.location.href)

    const [ viewType, setViewType ] = useState(url.searchParams.get("view") || "grid")
    const [ search, setSearch ] = useState(url.searchParams.get("q") || "")

    const onSearch = (q: string) => {
        url.searchParams.set("q", q)
        window.history.replaceState(null, "", url.href)
        setSearch(q)
    };

    const onSetViewType = (t: "grid" | "list") => {
        url.searchParams.set("view", t)
        window.history.replaceState(null, "", url.href)
        setViewType(t)
    };

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus Views</title>
                </Helmet>
            </HelmetProvider>
            <div className="row gap middle" style={{ marginTop: "-1em", padding: "6px 0 4px 0" }}>
                <div className="col col-0">
                    <h4 className="m-0"><i className="icon fa-solid fa-chart-pie color-blue-dark" /> Graphs</h4>
                </div>
                <div className="col center">
                    <input
                        type="search"
                        placeholder="Search Views by Name"
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                    />
                </div>
                <div className="col col-0 right">
                    <div className="toolbar flex">
                        <button
                            className={"btn" + (viewType === "grid" ? " active" : "")}
                            onClick={() => onSetViewType("grid")}
                            title="Grid View"
                        ><i className="fa-solid fa-grip" /></button>
                        <button
                            className={"btn" + (viewType === "list" ? " active" : "")}
                            onClick={() => onSetViewType("list")}
                            title="List View"
                            ><i className="fa-solid fa-list" /></button>
                    </div>    
                </div>
            </div>
            <hr className="mt-1 mb-1"/>
            <ViewsBrowser layout={ viewType === "grid" ? "grid" : "column" } search={search} />
        </div>
    )
}