import { useCallback } from "react"
import { Link }        from "react-router-dom"
import { useBackend }  from "../../hooks"
import { request }     from "../../backend"
import Loader          from "../generic/Loader"
import { AlertError }  from "../generic/Alert"
import ViewThumbnail   from "./ViewThumbnail"
import { classList }   from "../../utils"

import "./ViewsBrowser.scss"
import Collapse from "../generic/Collapse"


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
    sort?: "name-asc" | "name-desc" | "mod-asc" | "mod-desc" | "",
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
        default:
            if (requestId) {
                query.set("order", "createdAt:asc")
            } else {
                query.set("order", "name:asc,createdAt:asc")
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
        if (groupBy === "tag") {
            return renderByTag()
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
                    </Link>
                }
                { !!result?.length && (result || []).map((v, i) => (
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

        return renderGroups(groups, "database")
    }

    function renderByTag() {
        const groups: Record<string, any[]> = {};
        
        const unTagged: any[] = [];
        
        (result || []).forEach(item => {
            if (item.Tags && item.Tags.length) {
                item.Tags.forEach(tag => {
                    let label = tag.name;
                    let group = groups[label];
                    if (!group) {
                        group = groups[label] = [];
                    }
                    group.push(item)
                })
            } else {
                unTagged.push(item)
            }
        });

        if (unTagged.length) {
            groups["NO TAGS"] = unTagged
        }

        return renderGroups(groups, "sell")
    }

    function renderGroups(groups: Record<string, any[]>, icon: string) {
        return <>
            {
                Object.keys(groups).map((k, i) => (
                    <Collapse header={
                        <><i className="material-symbols-rounded bottom">{icon}</i> {k}</>
                    }>
                        <div className={ classList({
                            ["view-browser view-browser-" + layout] : true,
                            "nested": !!requestId,
                            "mb-2": true
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
                    </Collapse>
                ))
            }
        </>
    }

    return (
        <div>
            { renderItems() }
        </div>
    )
}
