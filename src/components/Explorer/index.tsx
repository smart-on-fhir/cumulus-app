import { useMemo }                    from "react"
import { Route, Routes, Link }        from "react-router-dom"
import Tree, { DataRow }              from "./Tree"
import Home                           from "../Home"
import Views                          from "../Views"
import Subscriptions                  from "../Subscriptions"
import SubscriptionGroups             from "../SubscriptionGroups"
import DataSites                      from "../DataSites"
import Studies                        from "../Studies"
import StudyAreas                     from "../StudyAreas"
import Tags                           from "../Tags"
import Packages                       from "../DataPackages"
import Catalog                        from "../Catalog"
import aggregator                     from "../../Aggregator"
import { request }                    from "../../backend"
import { app }                        from "../../types"
import { humanizeColumnName, sortBy } from "../../utils"
import { useAuth }                    from "../../auth"
import Terminology                    from "../../Terminology"
import "./Explorer.scss"


async function loadStudies() {
    await aggregator.initialize()
    const studies = await aggregator.getStudies()
    return studies.map(s => ({
        id    : `studies/${s.id}`,
        icon  : "experiment",
        title : s.label,
        render: () => <Link to={`/explorer/studies/${s.id}`}>{s.label}</Link>,
        loader: async () => {
            const versions = await aggregator.getStudyVersions(s.id)
            return versions.map(v => {
                return {
                    title : s.label + " v" + v,
                    icon  : "history",
                    id    : `studies/${s.id}/${v}`,
                    render: () => <Link to={`/explorer/studies/${s.id}/${v}`}>{v}</Link>,
                    loader: async () => {
                        const packages = await aggregator.filterPackages({ study: s.id, version: v })
                        return sortBy(packages, "name").map(p => {
                            const [, name] = p.id.trim().split("__")
                            return {
                                title : p.id,
                                icon  : p.type === "flat" ? "table" : "deployed_code",
                                id    : `packages/${p.id}`,
                                render: () => <Link to={`/explorer/packages/${p.id}`}>{humanizeColumnName(name)}</Link>,
                            }
                        })
                    }
                }
            })
        }
    }) as unknown as DataRow)
}

async function loadTags() {
    const items = await request<app.Tag[]>("/api/tags")
    return sortBy(items, "name").map(g => ({
        icon  : "sell",
        id    : "tags/" + g.id,
        render: () => <Link to={`/explorer/tags/${g.id}`}>{g.name}</Link>,
        loader: async () => ([
            {
                render: () => Terminology.subscription.namePlural,
                loader: async () => loadSubscriptionsForTag(g.id),
                id    : "tags/" + g.id + "/subscriptions",
            },
            {
                render: () => "Graphs",
                loader: async () => loadGraphsForTag(g.id),
                id    : "tags/" + g.id + "/graphs"
            }
        ])
    } as unknown as DataRow))
}

async function loadGraphs(drafts?: boolean) {
    const views = await request<app.View[]>(`/api/views?drafts=` + !!drafts)
    return sortBy(views, "name").map(graph => ({
        render   : () => <Link to={`/explorer/views/${graph.id}`}>{graph.name}</Link>,
        icon     : Terminology.graph.icon,
        id       : "views/" + graph.id,
        title    : graph.name
    } as unknown as DataRow))
}

async function loadGraphsForTag(tagId: number) {
    const tag = await request<app.Tag>(`/api/tags/${tagId}?creator=true&graphs=true`)
    return sortBy(tag.graphs!, "name").map(graph => ({
        render   : () => <Link to={`/explorer/views/${graph.id}`}>{graph.name}</Link>,
        icon     : Terminology.graph.icon,
        id       : "views/" + graph.id,
        title    : graph.name
    } as unknown as DataRow))
}

async function loadSubscriptionsForTag(tagId: number) {
    const tag = await request<app.Tag[]>(`/api/tags/${tagId}?creator=true&subscriptions=true`)
    // @ts-ignore
    return sortBy(tag.subscriptions, "name").map(s => ({
        render   : () => <Link to={`/explorer/requests/${s.id}`}>{s.name}</Link>,
        icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
        id       : "requests/" + s.id,
    } as unknown as DataRow))
}

async function loadSites() {
    const items = await aggregator.getSites()
    return sortBy(items, "name").filter(x => !!x.id).map(x => ({
        render: () => <Link to={`/explorer/sites/${x.id}`}>{ x.name }</Link>,
        title : x.name,
        id    : "sites/" + x.id,
        icon  : Terminology.site.icon,
    } as unknown as DataRow))
}

// =============================================================================

export default function Explorer() {

    let { user } = useAuth();

    const canReadSubscriptions = user!.permissions.includes("Subscriptions.read")
    const canListGroups        = user!.permissions.includes("SubscriptionGroups.read")
    const canReadTags          = user!.permissions.includes("Tags.read")
    const canReadStudyAreas    = user!.permissions.includes("StudyAreas.read")
    
    const DATA: DataRow[] = useMemo(() => {
        const DATA: DataRow[] = []
        
        DATA.push({
            id       : "",
            icon     : "folder_open",
            render   : () => "Local",
            open     : true,
            loader   : async () => {
                const data = []

                if (canListGroups && canReadSubscriptions) {
                    data.push({
                        id       : "groups",
                        icon     : Terminology.subscriptionGroup.icon,
                        render   : () => <Link to="/explorer/groups">{ Terminology.subscriptionGroup.namePlural }</Link>,
                        loader   : async function loadGroups() {
                            const groups = await request<app.SubscriptionGroup[]>("/api/request-groups")
                            return sortBy(groups, "name").filter(g => !!g.id).map(g => ({
                                render: () => <Link to={ `/explorer/groups/${g.id}` }>{ g.name }</Link>,
                                title : g.name,
                                id    : "groups/" + g.id,
                                icon  : Terminology.subscriptionGroup.icon,
                            } as unknown as DataRow));
                        },
                    })
                }

                if (canReadSubscriptions) {
                    data.push({
                        id       : "requests",
                        icon     : Terminology.subscription.icon,
                        render   : () => <Link to="/explorer/requests">{ Terminology.subscription.namePlural }</Link>,
                        loader   : async function loadSubscriptions() {
                            const items = await request<app.Subscription[]>(`/api/requests`)
                            return sortBy(items, "name").map((s: app.Subscription) => {
                                return {
                                    render   : () => <Link to={`/explorer/requests/${s.id}`}>{s.name}</Link>,
                                    icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
                                    title    : s.name,
                                    id       : "requests/" + s.id
                                } as unknown as DataRow
                            })
                        }
                    })
                }

                if (canReadStudyAreas) {
                    data.push({
                        id       : "study-areas",
                        icon     : Terminology.studyArea.icon,
                        render   : () => <Link to="/explorer/study-areas">{Terminology.studyArea.namePlural}</Link>,
                        loader   : async function loadStudyAreas() {
                            const items = await request<app.StudyArea[]>("/api/study-areas")
                            return sortBy(items, "name").map(x => ({
                                id    : `study-areas/${x.id}`,
                                title : x.name,
                                icon  : Terminology.studyArea.icon,
                                render: () => <Link to={`/explorer/study-areas/${x.id}`}>{x.name}</Link>,
                                loader: async () => sortBy(x.Subscriptions!, "name").map(s => ({
                                    id       : `requests/${s.id}`,
                                    icon     : s.metadata?.type === "flat" ? "table" : "deployed_code",
                                    title    : s.name,
                                    render   : () => <Link to={`/explorer/requests/${s.id}`}>{s.name}</Link>,
                                    loader   : async () => sortBy(s.Views!, "name").map(v => ({
                                        render: () => <Link to={`/explorer/views/${v.id}`}>{v.name}</Link>,
                                        icon  : Terminology.graph.icon,
                                        id    : `views/${v.id}`,
                                        title : v.name,
                                    }))
                                }))
                            } as unknown as DataRow))
                        }
                    })
                }
        
                data.push({
                    id       : "views",
                    render   : () => <Link to="/explorer/views">{Terminology.graph.namePlural}</Link>,
                    loader   : loadGraphs,
                    icon     : Terminology.graph.icon,
                })
        
                if (canReadTags) {
                    data.push({
                        id       : "tags",
                        render   : () => <Link to="/explorer/tags">{Terminology.tag.namePlural}</Link>,
                        loader   : loadTags,
                        icon     : Terminology.tag.icon,
                    })
                }

                return data;
            },
        })

        DATA.push({
            id       : "",
            render   : () => "Remote",
            open     : true,
            icon     : "cloud",
            loader   : async () => {
                const data = []

                data.push({
                    id       : "studies",
                    render   : () => <Link to="/explorer/studies">{Terminology.study.namePlural}</Link>,
                    loader   : loadStudies,
                    icon     : "experiment",
                })

                data.push({
                    id       : "sites",
                    render   : () => <Link to="/explorer/sites">{Terminology.site.namePlural}</Link>,
                    loader   : loadSites,
                    icon     : Terminology.site.icon
                })

                data.push({
                    id       : "catalog",
                    icon     : Terminology.catalog.icon,
                    render   : () => Terminology.catalog.namePlural,
                    loader   : async () => {
                        return [
                            {
                                render: () => <Link to="/explorer/catalog/icd10">ICD10 Diagnoses</Link>,
                                id    : "catalog/icd10",
                                icon  : Terminology.catalog.icon
                            } as unknown as DataRow,

                            {
                                render: () => <Link to="/explorer/catalog/loinc">LOINC Laboratories</Link>,
                                id    : "catalog/loinc",
                                icon  : Terminology.catalog.icon
                            } as unknown as DataRow
                        ]
                    },
                })

                return data
            }
        })

        DATA.push({
            id       : "",
            icon     : "person",
            render   : () => "Personal",
            open     : true,
            loader   : async () => {
                return [{
                    id       : "drafts",
                    render   : () => <Link to="/explorer/drafts">Draft {Terminology.graph.namePlural}</Link>,
                    loader   : () => loadGraphs(true),
                    icon     : "edit_square",
                }];
            },
        })

        return DATA

    }, [canReadSubscriptions, canListGroups, canReadTags, canReadStudyAreas])

    return (
        <div className="row explorer">
            <div className="col tree-column">
                <Tree data={DATA}/>
            </div>
            <div className="col stage-column">
                <Routes>
                    <Route index                element={ <Home /> } />
                    <Route path="views/*"       element={ <Views /> } />
                    <Route path="drafts/*"      element={ <Views /> } />
                    <Route path="requests/*"    element={ <Subscriptions /> } />
                    <Route path="groups/*"      element={ <SubscriptionGroups /> } />
                    <Route path="sites/*"       element={ <DataSites /> } />
                    <Route path="studies/*"     element={ <Studies /> } />
                    <Route path="study-areas/*" element={ <StudyAreas /> } />
                    <Route path="tags/*"        element={ <Tags /> } />
                    <Route path="packages/*"    element={ <Packages /> } />
                    <Route path="catalog/*"     element={ <Catalog /> } />
                    <Route path="*"             element="Page Not Found" />
                </Routes>
            </div>
        </div>
    )
} 
