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
    sort = ""
}: {
    layout?: "grid" | "column" | "list",
    requestId?: string | number,
    showDescription?: boolean,
    search?: string
    sort?: "name-asc" | "name-desc" | "mod-asc" | "mod-desc" | "rating-asc" | "rating-desc" | ""
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

    return (
        <div className={ classList({
            ["view-browser view-browser-" + layout] : true,
            "nested": !!requestId
        })}>
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
                (result || []).map((v, i) => (
                    <ViewThumbnail
                        key={i}
                        view={ v }
                        showDescription={layout === "grid" ? 0 : requestId ? 120 : 500}
                        search={search}
                    />
                ))
            }
        </div>
    )
}
