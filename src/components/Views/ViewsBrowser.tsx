import { useCallback } from "react"
import { Link }        from "react-router-dom"
import { useBackend }  from "../../hooks"
import { request }     from "../../backend"
import Loader          from "../Loader"
import { AlertError }  from "../Alert"

import "./ViewsBrowser.scss"


export default function ViewsBrowser({
    layout = "grid",
    requestId
}: {
    layout?: "grid" | "column",
    requestId?: string | number
}) {

    const { result, loading, error } = useBackend(
        useCallback(
            () => request<app.View[]>(
                requestId ?
                `/api/requests/${requestId}/views?order=id:asc` :
                "/api/views?order=id:asc"
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

    return (
        <div className={"view-browser view-browser-" + layout}>
            { requestId && <Link to={`/requests/${requestId}/create-view`} className="view-thumbnail view-thumbnail-add-btn">
                <div className="view-thumbnail-image">
                    <div className="plus-icon-wrapper">
                        <i className="fas fa-plus"/>
                    </div>
                </div>
                <div className="view-thumbnail-title color-blue">Create New View</div>
            </Link> }
            { (!result || !result.length) ?
                <p className="color-muted pt-2 pb-2">No Views found!</p> :
                (result || []).map((v, i) => (
                    <ViewThumbnail key={i} view={ v } />
                ))
            }
        </div>
    )
}

function ViewThumbnail({ view }: { view: app.View }) {
    return (
        <Link to={ "/views/" + view.id } className="view-thumbnail" title={ view.description || undefined }>
            <div className="view-thumbnail-image" style={{
                backgroundImage: `url('${view.screenShot ? `/api/views/${ view.id }/screenshot` : "/view.png"}')`
            }}/>
            <div className="view-thumbnail-title">
                { view.name }
                {/* <div className="view-thumbnail-description color-muted">{ view.description }</div> */}
            </div>
            
        </Link>
    )
}