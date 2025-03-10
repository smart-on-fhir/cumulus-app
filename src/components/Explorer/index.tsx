import { useEffect, useMemo, useState } from "react"
import { useSearchParams }              from "react-router-dom"
import DataPackageView                  from "./DataPackageView"
import StudyView                        from "./StudyView"
import Tree, { DataRow }                from "./Tree"
import Dashboard                        from "../Dashboard"
import EditView                         from "../Dashboard/EditView"
import SubscriptionView                 from "../Subscriptions/View"
import SubscriptionGroupView            from "../SubscriptionGroups/View"
import SubscriptionGroupList            from "../SubscriptionGroups/List"
import TagsList                         from "../Tags/List"
import TagView                          from "../Tags/View"
import ListStudyAreas                   from "../StudyAreas/List"
import ViewStudyArea                    from "../StudyAreas/View"
import aggregator                       from "../../Aggregator"
import { request }                      from "../../backend"
import { app }                          from "../../types"
import { humanizeColumnName, sortBy }   from "../../utils"
import { useAuth }                      from "../../auth"
import Terminology                      from "../../Terminology"
import ListSites                        from "../DataSites/List"
import ViewSite                         from "../DataSites/View"
import "./Explorer.scss"



function sortByName(arr: any[]): typeof arr {
    return sortBy(arr, "name")
}

// Data Loaders ================================================================

async function loadStudies() {
    await aggregator.initialize()
    const studies = await aggregator.getStudies()
    return studies.map(s => ({
        id    : `/studies/${s.id}`,
        icon  : "experiment",
        title : s.label,
        render: () => s.label,
        // view  : () => <StudyView study={s} key={s.id} />,
        loader: async () => {
            const versions = await aggregator.getStudyVersions(s.id)
            return versions.map(v => {
                return {
                    title : s.label + " v" + v,
                    icon  : "history",
                    id    : `/studies/${s.id}/${v}`,
                    render: () => v,
                    view  : () => <StudyView study={s} key={s.id + ":" + v} version={v} />,
                    // view  : () => <DataPackageView pkg={p} key={p.id} />,
                    loader: async () => {
                        const packages = await aggregator.filterPackages({ study: s.id, version: v })
                        return sortByName(packages).map(p => {
                            const [, name] = p.id.trim().split("__")
                            return {
                                title : p.id,
                                icon  : "deployed_code",
                                id    : `/studies/${s.id}/${v}/${p.id}`,
                                // render: () => ellipsis(humanizeColumnName(name), 28, "start"),
                                render: () => humanizeColumnName(name),
                                view  : () => <DataPackageView pkg={p} key={p.id} />,
                            }
                        })
                    }
                }
            })

        //     const packages = await aggregator.filterPackages({ study: s.id })
        //     // const uniquePackages = packages.reduce((prev, cur) => {
        //     //     if (!prev.find(p => p.name === cur.name)) {
        //     //         prev.push(cur)
        //     //     }
        //     //     return prev
        //     // }, [] as DataPackage[])
        
        //     return sortByName(packages).map(p => {
        //         const [, name, version] = p.id.trim().split("__")
        //         return {
        //             title : p.id,
        //             icon  : "deployed_code",
        //             id    : `/studies/${s.id}/${p.id}`,
        //             render: () => <>{ellipsis(humanizeColumnName(name), 24, "start")}<span className="color-muted"> {version}</span></>,
        //             view  : () => <DataPackageView pkg={p} key={p.id} />,
        //             // loader: async () => {
        //             //     const versions = packages.filter(x => x.name === p.name).map(p => p.version)
        //             //     return sortByName(versions).map(x => ({
        //             //         render: () => x,
        //             //         // value: versions
        //             //     }))
        //             // }
        //         }
        //     })
        }
    }) as unknown as DataRow)
}

async function loadGroups() {
    const groups = await request<app.SubscriptionGroup[]>("/api/request-groups")
    
    return sortByName(groups).map(g => {
        if (g.id) {
            return {
                render: () => g.name,
                loader: () => loadSubscriptionsForGroup(g),
                view  : () => <SubscriptionGroupView id={g.id} />,
                title : g.name,
                id    : "/groups/" + g.id,
                icon  : Terminology.subscriptionGroup.icon
            } as unknown as DataRow
        }

        return {
            render: () => g.name,
            loader: async () => {
                return g.requests.map((s: any) => {
                    const id = `/groups/GENERAL/${s.id}`
                    return {
                        render: () => s.name,
                        loader   : s.metadata?.type === "flat" ? undefined : () => loadGraphsForSubscription(s, id),
                        icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
                        iconColor: "#369",
                        title    : s.name,
                        view     : () => <SubscriptionView id={s.id} />,
                        id
                    } as unknown as DataRow
                })
            },
            // view  : () => <SubscriptionGroupView id={g.id} />,
            title : "The GENERAL group is a virtual container for items not explicitly assigned to other group",
            id    : "/groups/GENERAL",
            icon  : Terminology.subscriptionGroup.icon
        } as unknown as DataRow
    });

    
    // const children = sortByName(groups).filter(g => !!g.id).map(g => ({
    //     render: () => g.name,
    //     loader: () => loadSubscriptionsForGroup(g),
    //     view  : () => <SubscriptionGroupView id={g.id} />,
    //     title : g.name,
    //     id    : "/groups/" + g.id
    // } as unknown as DataRow));

    // groups.find(g => !g.id)?.requests.forEach(s => {
    //     const id = `/groups/GENERAL/${s.id}`
    //     children.push({
    //         render: () => s.name,
    //         loader   : s.metadata?.type === "flat" ? undefined : () => loadGraphsForSubscription(s, id),
    //         icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
    //         iconColor: "#369",
    //         title    : s.name,
    //         view     : () => <SubscriptionView id={s.id} />,
    //         id
    //     } as unknown as DataRow)
    // })

    // return children
}

async function loadSubscriptionsForGroup(group: app.SubscriptionGroup) {
    const items = await request<app.Subscription[]>(`/api/requests?where=groupId:${group.id || "null"}`)
    return sortByName(items).map((s: app.Subscription) => {
        const id = `/groups/${group.id}/subscriptions/${s.id}`
        return {
            render   : () => s.name,
            loader   : s.metadata?.type === "flat" ? undefined : () => loadGraphsForSubscription(s, id),
            icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
            iconColor: "#369",
            title    : s.name,
            view     : () => <SubscriptionView id={s.id} />,
            id
        } as unknown as DataRow
    })
}

async function loadGraphsForSubscription(subscription: app.Subscription, pathPrefix = "") {
    const items = await request<app.View[]>(`/api/requests/${subscription.id}/views`)
    return sortByName(items).map(s => ({
        render   : () => s.name,
        // view     : () => <ChartViewer model={{ ...s, Subscription: subscription }} />,
        view     : () => <Dashboard subscription={subscription} view={s} key={s.id} />,
        icon     : Terminology.graph.icon,
        iconColor: "#369",
        id       : `${pathPrefix}/graphs/${s.id}`,
        title    : s.name,
    } as unknown as DataRow))
}

async function loadStudyAreas() {
    const items = await request<app.StudyArea[]>("/api/study-areas")
    return sortByName(items).map(x => ({
        id    : `/study-areas/${x.id}`,
        title : x.name,
        icon  : Terminology.studyArea.icon,
        render: () => x.name,
        view  : () => <ViewStudyArea id={x.id} />,
        loader: async () => sortByName(x.Subscriptions!).map(s => ({
            id       : `/study-areas/${x.id}/subscriptions/${s.id}`,
            icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
            iconColor: "#369",
            title    : s.name,
            render   : () => s.name,
            view     : () => <SubscriptionView id={s.id} />,
            loader   : async () => sortByName(s.Views!).map(v => ({
                render: () => v.name,
                icon  : Terminology.graph.icon,
                id    : `/study-areas/${x.id}/subscriptions/${s.id}/views/${v.id}`,
                view  : () => <Dashboard subscription={s} view={v} key={v.id} />,
                title : v.name,
            }))
        }))
    } as unknown as DataRow))
}

async function loadTags() {
    const items = await request<app.Tag[]>("/api/tags")
    return sortByName(items).map(g => ({
        icon  : "sell",
        id    : "/tags/" + g.id,
        render: () => g.name,
        view  : () => <TagView id={g.id} />,
        loader: async () => ([
            {
                render: () => Terminology.subscription.namePlural,
                loader: async () => loadSubscriptionsForTag(g.id),
                id    : "/tags/" + g.id + "/subscriptions",
            },
            {
                render: () => "Graphs",
                loader: async () => loadGraphsForTag(g.id),
                id    : "/tags/" + g.id + "/graphs"
            }
        ])
    } as unknown as DataRow))
}

async function loadGraphsForTag(tagId: number) {
    const tag = await request<app.Tag>(`/api/tags/${tagId}?creator=true&graphs=true`)
    // @ts-ignore
    return sortByName(tag.graphs).map(graph => ({
        render   : () => graph.name,
        icon     : Terminology.graph.icon,
        iconColor: "#369",
        id       : "/tags/" + tagId + "/graphs/" + graph.id,
        view     : () => <EditView id={graph.id} />,
        title    : graph.name
    } as unknown as DataRow))
}

async function loadSubscriptionsForTag(tagId: number) {
    const tag = await request<app.Tag[]>(`/api/tags/${tagId}?creator=true&subscriptions=true`)
    // @ts-ignore
    return sortByName(tag.subscriptions).map(s => ({
        render   : () => s.name,
        icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
        iconColor: "#369",
        id       : "/tags/" + tagId + "/subscriptions/" + s.id,
        view     : () => <SubscriptionView id={s.id} />,
    } as unknown as DataRow))
}

async function loadSites() {
    const items = await aggregator.getSites()
    return sortByName(items).filter(x => !!x.id).map(x => ({
        render: () => x.name,
        view  : () => <ViewSite site={x} />,
        title : x.name,
        id    : "/sites/" + x.id,
        icon  : Terminology.site.icon
    } as unknown as DataRow))
}

// =============================================================================
function isIdInPath(id: string, path: string) {
    const a = path.split("/")
    const b = id.split("/")
    return b.every((segment, i) => a[i] === segment)
}

async function find(path: string, branch: DataRow[]) {
    for (const node of branch) {
        if (node.id === path) {
            return node
        }
        if (!!node.loader && isIdInPath(node.id, path)) {
            return find(path, await node.loader())
        }
    }
}

export default function Explorer() {

    let { user } = useAuth();

    const canReadSubscriptions = user!.permissions.includes("Subscriptions.read")
    const canListGroups        = user!.permissions.includes("SubscriptionGroups.read")
    const canReadTags          = user!.permissions.includes("Tags.read")
    const canReadStudyAreas    = user!.permissions.includes("StudyAreas.read")
    

    const DATA: DataRow[] = useMemo(() => {
        const DATA: DataRow[] = []

        if (canListGroups && canReadSubscriptions) {
            DATA.push({
                id       : "/groups",
                render   : () => Terminology.subscriptionGroup.namePlural,
                view     : () => <SubscriptionGroupList />,
                loader   : loadGroups,
                icon     : Terminology.subscriptionGroup.icon,
                iconColor: "#880",
            })
        }

        if (canReadStudyAreas) {
            DATA.push({
                id       : "/study-areas",
                render   : () => "Study Areas",
                view     : () => <ListStudyAreas />,
                loader   : loadStudyAreas,
                icon     : Terminology.studyArea.icon,
                iconColor: "#099"
            })
        }

        if (canReadTags) {
            DATA.push({
                id       : "/tags",
                render   : () => "Tags",
                view     : () => <TagsList />,
                loader   : loadTags,
                icon     : Terminology.tag.icon,
                iconColor: "#C83"
            })
        }

        DATA.push({
            id       : "/studies",
            render   : () => "Studies",
            loader   : loadStudies,
            icon     : "experiment",
            iconColor: "#936"
        })

        DATA.push({
            id       : "/sites",
            render   : () => "Sites",
            view     : () => <ListSites />,
            loader   : loadSites,
            icon     : Terminology.site.icon,
            iconColor: "#09C"
        })

        return DATA
    }, [canReadSubscriptions, canListGroups, canReadTags, canReadStudyAreas])


    const [selected, setSelected] = useState<DataRow | null>(null)
    const [params, setParams] = useSearchParams()
    const path = params.get("path") || "/groups"

    useEffect(() => {
        find(path, DATA).then(node => {
            if (node) {
                setSelected(node)
            } else {
                setSelected(null)
            }
        })
    }, [ path, DATA])

    return (
        <div className="row explorer">
            <div className="col tree-column">
                <Tree data={DATA} onSelect={s => {
                    if (s.view) {
                        params.set("path", s.id)
                        setParams(params)
                    }
                }} path={path} />
            </div>
            <div className="col stage-column">
                { selected?.view?.() }
            </div>
        </div>
    )
}
