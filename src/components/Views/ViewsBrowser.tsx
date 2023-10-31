import { useCallback } from "react"
import { Link }        from "react-router-dom"
import { useBackend }  from "../../hooks"
import { request }     from "../../backend"
import Loader          from "../generic/Loader"
import { AlertError }  from "../generic/Alert"
import ViewThumbnail   from "./ViewThumbnail"
import { classList }   from "../../utils"
import Collapse        from "../generic/Collapse"
import { CustomSelection, WithSelection } from "../generic/WithSelection"
import { app }         from "../../types"

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
    sort?: "name-asc" | "name-desc" | "mod-asc" | "mod-desc" | "",
    groupBy?: "tag" | "subscription" | ""
}) {

    const query = new URLSearchParams()

    query.set("attributes", "id,name,description,updatedAt,screenShot")

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
        return <Loader msg="Loading graphs..." />
    }

    if (error) {
        return <AlertError><b>Error loading graphs</b>: { error + "" }</AlertError>
    }

    result = result || [];

    if (!requestId && !result.length) {
        return <p className="center">
            No Graphs found in the database. You can start by selecting one of the
            existing <Link to="/requests" className="link">subscriptions</Link> and
            then you can create new graph from it's data.
        </p>
    }

    if (search) {
        result = result.filter(view => {
            return view.name.toLowerCase().includes(search.toLowerCase()) ||
                view.description.toLowerCase().includes(search.toLowerCase())
        });

        if (!result.length) {
            return <p className="center bold color-orange">
                No Graphs found matching your search!
            </p>
        }
    }

    function renderItems(selection: CustomSelection<number>) {
        if (groupBy === "subscription") {
            return renderBySubscription(selection)
        }
        if (groupBy === "tag") {
            return renderByTag(selection)
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
                            Create New Graph
                            <div className="view-thumbnail-description grey-out" style={{ whiteSpace: "normal"}}>
                                Click here to create new view from the data provided
                                by this subscription
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
                            selection={selection}
                        />
                    ))
                }
            </div>
        )
    }

    function renderBySubscription(selection: CustomSelection<number>) {
        const groups: Record<string, any[]> = {};
        (result || []).forEach(item => {
            let label = item.DataRequest!.name;
            let group = groups[label];
            if (!group) {
                group = groups[label] = [];
            }
            group.push(item)
        });

        return renderGroups(groups, "database", selection)
    }

    function renderByTag(selection: CustomSelection<number>) {
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

        return renderGroups(groups, "sell", selection)
    }

    function renderGroups(groups: Record<string, any[]>, icon: string, selection: CustomSelection<number>) {
        return <>
            {
                Object.keys(groups).map((k, i) => (
                    <Collapse key={i} header={
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
                                    selection={selection}
                                />
                            ))
                        }
                        </div>
                    </Collapse>
                ))
            }
        </>
    }

    return <WithSelection<number>>{(selection) => {
        return <div>{ renderItems(selection) }</div>
    }}</WithSelection>
}
