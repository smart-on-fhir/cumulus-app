import { useCallback } from "react"
import { Link }        from "react-router-dom"
import { useBackend }  from "../../hooks"
import { request }     from "../../backend"
import Loader          from "../Loader"
import { AlertError }  from "../Alert"
import ViewThumbnail   from "./ViewThumbnail"

import "./ViewsBrowser.scss"


export default function ViewsBrowser({
    layout = "grid",
    requestId,
    search = ""
}: {
    layout?: "grid" | "column",
    requestId?: string | number,
    showDescription?: boolean,
    search?: string
}) {

    let { result, loading, error } = useBackend(
        useCallback(
            () => request<app.View[]>(
                requestId ?
                    `/api/requests/${requestId}/views?order=normalizedRating:desc,createdAt:asc` :
                    "/api/views?order=normalizedRating:desc,name:asc,createdAt:asc"
            ),
            [requestId]
        ),
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
        result = result.filter(view => view.name.toLowerCase().includes(search.toLowerCase()));
    }

    return (
        <div className={"view-browser view-browser-" + layout}>
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
                        showDescription={layout === "grid" ? 0 : requestId ? 120 : 200}
                        search={search}
                    />
                ))
            }
        </div>
    )
}
