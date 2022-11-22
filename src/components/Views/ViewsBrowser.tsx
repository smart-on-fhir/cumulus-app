import { useCallback } from "react"
import { Link }        from "react-router-dom"
import { useBackend }  from "../../hooks"
import { request }     from "../../backend"
import Loader          from "../Loader"
import { AlertError }  from "../Alert"
import ViewThumbnail   from "./ViewThumbnail"
import { classList }   from "../../utils"

import "./ViewsBrowser.scss"


export default function ViewsBrowser({
    layout = "grid",
    requestId,
    search = "",
    sort = "",
    groupBy
}: {
    layout?: "grid" | "column" | "list",
    requestId?: string | number,
    showDescription?: boolean,
    search?: string
    sort?: "name-asc" | "name-desc" | "mod-asc" | "mod-desc" | "rating-asc" | "rating-desc" | "",
    groupBy?: "tag" | "subscription" | ""
}) {

    const query = new URLSearchParams()

    switch (sort) {
        case "mod-asc":
            query.set("order", "updatedAt:asc");
        break;
        case "mod-desc":
            query.set("order", "updatedAt:desc");
        break;
        case "name-asc":
            query.set("order", "name:asc");
        break;
        case "name-desc":
            query.set("order", "name:desc");
        break;
        case "rating-asc":
            query.set("order", "normalizedRating:asc");
        break;
        case "rating-desc":
            query.set("order", "normalizedRating:desc");
        break;
        default:
            if (requestId) {
                query.set("order", "normalizedRating:desc,createdAt:asc")
            } else {
                query.set("order", "normalizedRating:desc,name:asc,createdAt:asc")
            }
        break;
    }

    const url = requestId ?
        `/api/requests/${requestId}/views?${query.toString()}` :
        `/api/views?${query.toString()}`;

    let { result, loading, error } = useBackend(
        useCallback(() => request<app.View[]>(url), [url]),
        true
    );

    if (loading) {
        return <Loader msg="Loading views..." />
    }

    if (error) {
        return <AlertError><b>Error loading views</b>: { error + "" }</AlertError>
    }

    result = result || [];

    if (search) {
        result = result.filter(view => {
            return view.name.toLowerCase().includes(search.toLowerCase()) ||
                view.description.toLowerCase().includes(search.toLowerCase())
        });
    }

    function renderItems() {
        if (groupBy === "subscription") {
            return renderBySubscription()
        }
        return (
            <div className={ classList({
                ["view-browser view-browser-" + layout] : true,
                "nested": !!requestId
            })}>{
                (result || []).map((v, i) => (
                    <ViewThumbnail
                        key={i}
                        view={ v }
                        showDescription={layout === "grid" ? 0 : requestId ? 120 : 500}
                        search={search}
                    />
                ))
            }</div>)
    }

    function renderBySubscription() {
        const groups: Record<string, any[]> = {};
        (result || []).forEach(item => {
            let label = item.DataRequest!.name;
            let group = groups[label];
            if (!group) {
                group = groups[label] = [];
            }
            group.push(item)
        });

        return <>
            {
                Object.keys(groups).map((k, i) => (
                    <div className="graph-group" key={i}>
                        <h5 className="graph-group-header color-brand-2">
                            <i className="material-symbols-rounded bottom">database</i> {k}
                        </h5>
                        <div className={ classList({
                            ["view-browser view-browser-" + layout] : true,
                            "nested": !!requestId
                        })}>
                        {
                            groups[k].map((v, y) => (
                                <ViewThumbnail
                                    key={y}
                                    view={ v }
                                    showDescription={layout === "grid" ? 0 : requestId ? 120 : 500}
                                    search={search}
                                />
                            ))
                        }
                        </div>
                    </div>
                ))
            }
        </>
    }

    return (
        <div>
            { requestId && <Link to={`/requests/${requestId}/create-view`} className="view-thumbnail view-thumbnail-add-btn">
                <div className="view-thumbnail-image">
                    <div className="plus-icon-wrapper">
                        <i className="fas fa-plus"/>
                    </div>
                </div>
                <div className="view-thumbnail-title color-blue">
                    Create New View
                    <div className="view-thumbnail-description grey-out" style={{ whiteSpace: "normal"}}>
                        Click here to create new view from the data provided
                        by this data subscription
                    </div>
                </div>
            </Link> }
            { !result.length ?
                <p className="color-muted pt-2 pb-2">No Views found!</p> :
                renderItems()
            }
        </div>
    )
}
