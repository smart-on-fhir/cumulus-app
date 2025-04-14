import { useCallback, useState }       from "react"
import { Link }                        from "react-router-dom"
import SubscriptionLink                from "./SubscriptionLink"
import { useBackend, useLocalStorage } from "../../hooks"
import { request }                     from "../../backend"
import Breadcrumbs                     from "../generic/Breadcrumbs"
import { useAuth }                     from "../../auth"
import Loader                          from "../generic/Loader"
import { AlertError }                  from "../generic/Alert"
import Grid                            from "../generic/Grid"
import Collapse                        from "../generic/Collapse"
import { app }                         from "../../types"
import Terminology                     from "../../Terminology"

import "./ListPage.scss";


export default function SubscriptionsListPage()
{
    const url = new URL(window.location.href)
    const { user } = useAuth();
    const [search, setSearch] = useState("")
    const [ starOnly, setStarOnly ] = useState<Boolean>(url.searchParams.get("star") === "1")
    const [starredSubscriptions] = useLocalStorage("starredSubscriptions")
    const list = String(starredSubscriptions || "").trim().split(/\s*,\s*/);

    const toggleStar = () => {
        if (starOnly) {
            url.searchParams.delete("star")
        } else {
            url.searchParams.set("star", "1")
        }
        window.history.replaceState(null, "", url.href)
        setStarOnly(!starOnly)
    };

    const { loading, error, result: groups } = useBackend(
        useCallback(() => request<app.SubscriptionGroup[]>("/api/requests/by-group"), []),
        true
    );

    if (loading) {
        return <Loader msg={`Loading ${Terminology.subscription.namePlural}...`} />
    }

    if (error) {
        return <AlertError><b>Error Loading {Terminology.subscription.namePlural}: </b>{ error + "" }</AlertError>
    }

    let groupsData: app.SubscriptionGroup[] = [];

    

    (groups || []).forEach(g => {
        if (starOnly) {
            groupsData.push({ ...g, requests: g.requests.filter((r: any) => list.includes(r.id + "")) })
        } else {
            groupsData.push({ ...g })
        }
    })

    groupsData = groupsData?.filter(g => g.requests.length > 0)

    return (
        <div>
            <title>{Terminology.subscription.namePlural}</title>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: Terminology.subscription.namePlural, href: "/requests" }
            ]} />
            <header className="requests-header">
                <div className="row wrap mt-2">
                    <h3 className="col middle center mt-05 mb-05 nowrap" style={{ flex: "1 1 8em" }}>
                        <div>
                            <span className="icon material-symbols-outlined color-brand-2">
                                {Terminology.subscription.icon}
                            </span> {Terminology.subscription.namePlural}
                        </div>
                    </h3>
                    <div className="col col-4 middle center mt-05 mb-05 pl-1" style={{ flex: "200 1 10em" }}>
                        <input type="search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    { user?.permissions.includes("Subscriptions.create") && (
                        <div className="col middle center mt-05 mb-05" style={{ flex: "1 1 240px" }}>
                            <div className="row">
                                <button className="btn btn-virtual mr-05" data-tooltip="Toggle show starred only" onClick={toggleStar}>
                                    { starOnly ? <i className="fa-solid fa-star color-brand-2" /> : <i className="fa-regular fa-star color-muted" /> }
                                </button>
                                <Link className="btn color-blue-dark btn-virtual" to="/requests/new">
                                    <b className="color-green"><i className="fa-solid fa-circle-plus" /> New {Terminology.subscription.nameSingular}</b>
                                </Link>
                            </div>
                        </div>
                    ) }
                </div>
                <hr className="mb-2"/>
            </header>

            { !groupsData?.length ?
                <div className="center">
                    <br/>
                    <p>No {Terminology.subscription.namePlural} found in the database! You can start by creating new {Terminology.subscription.nameSingular}.</p>
                    <br/>
                    <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create {Terminology.subscription.nameSingular}</Link>
                </div> :
                groupsData.map((group, i) => {
                    const links = group.requests.filter(r => {
                        if (search) {
                            return r.name.toLowerCase().includes(search.toLowerCase())
                        }
                        return true
                    }).map((item, y) => (
                        <SubscriptionLink request={item} href="/requests/:id" key={y} search={search} />
                    ));

                    if (links.length > 0) {
                        return (
                            <Collapse key={i} header={
                                <>
                                    <i className="icon material-symbols-outlined color-brand-2">{Terminology.subscriptionGroup.icon}</i>
                                    { group.name }
                                </>
                            }>
                                <Grid cols="22em" key={i} className="link-list mt-05 mb-2">{ links }</Grid>
                            </Collapse>
                        )
                    }

                    return null
                })
            }
        </div>
    )
}
