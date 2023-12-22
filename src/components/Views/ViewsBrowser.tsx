import { useCallback }                    from "react"
import { Link }                           from "react-router-dom"
import ViewThumbnail                      from "./ViewThumbnail"
import { AlertError }                     from "../generic/Alert"
import Collapse                           from "../generic/Collapse"
import Loader                             from "../generic/Loader"
import { CustomSelection, WithSelection } from "../generic/WithSelection"
import { useBackend }                     from "../../hooks"
import { request }                        from "../../backend"
import { classList }                      from "../../utils"
import { app }                            from "../../types"
import { useAuth }                        from "../../auth"
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

    let { user } = useAuth();

    const canCreateGraphs = user?.permissions.includes("Graphs.create")

    const query = new URLSearchParams()

    query.set("attributes", "id,creatorId,name,description,updatedAt,screenShot")

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
            No Graphs found. You can start by selecting one of the
            existing <Link to="/requests" className="link">subscriptions</Link> and
            then create new graph from it's data.
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

    function renderItems(selection: CustomSelection<app.View>) {
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
                { requestId && !canCreateGraphs && result?.length === 0 && <div className="color-red small">You cannot see any of the graphs, and you are not allowed to create new graphs!</div> }
                { requestId && canCreateGraphs && <Link to={`/requests/${requestId}/create-view`} className="view-thumbnail view-thumbnail-add-btn">
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

    function renderBySubscription(selection: CustomSelection<app.View>) {
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

    function renderByTag(selection: CustomSelection<app.View>) {
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

    function renderGroups(groups: Record<string, any[]>, icon: string, selection: CustomSelection<app.View>) {
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

    return (
        <WithSelection<app.View> equals={(a, b) => !!a.id && a.id === b.id}>
            { selection => <div>{ renderItems(selection) }</div> }
        </WithSelection>
    )
}
