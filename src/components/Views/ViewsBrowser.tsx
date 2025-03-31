import { ReactNode, useCallback }         from "react"
import { Link }                           from "react-router-dom"
import ViewThumbnail                      from "./ViewThumbnail"
import { AlertError }                     from "../generic/Alert"
import Collapse                           from "../generic/Collapse"
import Loader                             from "../generic/Loader"
import { CustomSelection, WithSelection } from "../generic/WithSelection"
import { useBackend, useLocalStorage }    from "../../hooks"
import { request }                        from "../../backend"
import { classList }                      from "../../utils"
import { app }                            from "../../types"
import { useAuth }                        from "../../auth"
import Terminology                        from "../../Terminology"
import "./ViewsBrowser.scss"


interface GroupEntry {
    items: any[]
    link?: {
        to: string
        txt: string
    }
}

export default function ViewsBrowser({
    layout = "grid",
    requestId,
    search = "",
    sort = "",
    groupBy,
    drafts,
    starOnly,
    minColWidth,
    header,
    footer,
    pkgId
}: {
    layout?: "grid" | "column" | "list",
    requestId?: string | number,
    showDescription?: boolean,
    search?: string
    sort?: "name-asc" | "name-desc" | "mod-asc" | "mod-desc" | "",
    groupBy?: "tag" | "subscription" | ""
    drafts?: boolean
    starOnly?: boolean
    minColWidth?: string
    header?: ReactNode
    footer?: ReactNode
    pkgId?: string
}) {

    let { user } = useAuth();

    const [ favoriteGraphs ] = useLocalStorage("favoriteGraphs")

    const canCreateGraphs = user?.permissions.includes("Graphs.create")

    const query = new URLSearchParams()

    query.set("attributes", "id,creatorId,name,description,updatedAt,screenShot,isDraft")

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
            query.set("order", "createdAt:desc,name:asc")
        break;
    }

    if (drafts) {
        query.set("drafts", "true")
    }

    if (pkgId) {
        query.set("pkg", pkgId)
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

    if (!requestId && !pkgId && !result.length) {
        return <p className="center">No Graphs found.</p>
    }

    if (starOnly) {
        const list = String(favoriteGraphs || "").trim().split(/\s*,\s*/)
        
        result = result.filter(view => list.includes(view.id + ""));

        if (!result.length) {
            return <p className="center bold color-orange">
                No starred Graphs found!
            </p>
        }
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
                ["view-browser view-browser-" + layout] : true
            })}
                style={
                    minColWidth ?
                        { gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}, 1fr))` } :
                        undefined
                }
            >
                { requestId && !canCreateGraphs && result?.length === 0 && <div className="color-red small">You cannot see any of the graphs, and you are not allowed to create new graphs!</div> }
                { header }
                { (result || []).map((v, i) => (
                        <ViewThumbnail
                            key={i}
                            view={ v }
                            showDescription={layout === "grid" ? 0 : requestId ? 120 : 500}
                            search={search}
                            selection={selection}
                        />
                    ))
                }

                { footer }
            </div>
        )
    }

    function renderBySubscription(selection: CustomSelection<app.View>) {
        const groups: Record<string, GroupEntry> = {};
        (result || []).forEach(item => {
            if (item.Subscription) {
                let label = item.Subscription.name;
                let group = groups[label];
                if (!group) {
                    group = groups[label] = {
                        link: { to: `/requests/${item.Subscription.id}`, txt: "View " + Terminology.subscription.nameSingular },
                        items: []
                    };
                }
                group.items.push(item)
            } else if (item.packageId) {
                let label = item.packageId;
                let group = groups[label];
                if (!group) {
                    group = groups[label] = {
                        link: { to: `/requests/${item.packageId}`, txt: "View " + Terminology.subscription.nameSingular },
                        items: []
                    };
                }
                group.items.push(item)
            }
            
        });

        return renderGroups(groups, "database", selection)
    }

    function renderByTag(selection: CustomSelection<app.View>) {
        const groups: Record<string, GroupEntry> = {};
        
        const unTagged: GroupEntry = { items: [] };
        
        (result || []).forEach(item => {
            if (item.Tags && item.Tags.length) {
                item.Tags.forEach(tag => {
                    let label = tag.name;
                    let group = groups[label];
                    if (!group) {
                        group = groups[label] = {
                            link: { to: `/tags/${tag.id}`, txt: "View Tag" },
                            items: []
                        };
                    }
                    group.items.push(item)
                })
            } else {
                unTagged.items.push(item)
            }
        });

        if (unTagged.items.length) {
            groups["NO TAGS"] = unTagged
        }

        return renderGroups(groups, "sell", selection)
    }

    function renderGroups(groups: Record<string, GroupEntry>, icon: string, selection: CustomSelection<app.View>) {
        return <>
            {
                Object.keys(groups).map((k, i) => (
                    <Collapse key={i} header={
                        <span>
                            <i className="material-symbols-rounded bottom">{icon}</i> {k}
                            {
                                groups[k].link ?
                                    <Link className="collapse-header-link link" to={groups[k].link!.to}>
                                        {groups[k].link!.txt} <i className="fa-solid fa-arrow-up-right-from-square" />
                                    </Link> :
                                    ""
                            }
                        </span>
                    }>
                        <div className={ classList({
                            ["view-browser view-browser-" + layout] : true,
                            "mb-2": true
                        })}>
                        {
                            groups[k].items.map((v, y) => (
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
