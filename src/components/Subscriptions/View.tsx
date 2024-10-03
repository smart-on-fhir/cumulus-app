import { useCallback }            from "react"
import { useParams }              from "react-router"
import { Link }                   from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import Markdown                   from "../generic/Markdown"
import { useAuth }                from "../../auth"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import Breadcrumbs                from "../generic/Breadcrumbs"
import { Format }                 from "../Format"
import ViewsBrowser               from "../Views/ViewsBrowser"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import { classList }              from "../../utils"
import Tag                        from "../Tags/Tag"
import TransmissionView           from "./Transmissions/TransmissionView"
import { app }                    from "../../types"
import DataViewer                 from "./DataViewer"
import ColumnsTable               from "./ColumnsTable"


export default function SubscriptionView(): JSX.Element
{
    const { id } = useParams()
    const { user } = useAuth();

    const { loading, error, result: model, execute: fetch } = useBackend<app.Subscription>(
        useCallback(() => request("/api/requests/" + id + "?group=true&graphs=true&tags=true"), [id]),
        true
    )

    const {
        loading: refreshing,
        error  : refreshError,
        execute: refresh
    } = useBackend(
        useCallback(() => request<app.Subscription>(`/api/requests/${id}/refresh`).then(fetch), [id, fetch])
    );

    if (loading && !model) {
        return <Loader/>
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    if (!model) {
        return <AlertError>Failed to load Subscription</AlertError>
    }

    const isFlatData = model.metadata?.type === "flat"

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Subscription: {model.name}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Subscriptions", href: "/requests" },
                { name: model.name }
            ]}/>
            <h3><i className="fas fa-database" /> { model.name }</h3>
            <div className="markdown">
                <Markdown>{ model.description || "" }</Markdown>
            </div>
            <br/>
            <div className="row gap-2 wrap">
                <div className="col col-6 responsive">
                    <h5>Status</h5>
                    <hr/>
                    <div className="left">
                        <table style={{ tableLayout: "fixed" }}>
                            <tbody>
                                <tr>
                                    <th className="right pr-1 pl-1" style={{ width: "8em" }}>Group:</th>
                                    <td>{
                                        model.group ?
                                            <Link to={`/groups/${model.group.id}`} className="link" title={model.group.description}>{ model.group.name }</Link> :
                                            "GENERAL"
                                        }
                                    </td>
                                </tr>
                                { !model.dataURL?.startsWith("aggregator://") && 
                                    <>
                                        <tr>
                                            <th className="right pr-1 pl-1">Status:</th>
                                            <td>
                                                {
                                                    model.completed ?
                                                    <>completed <Format value={ model.completed } format="date-time" /></> :
                                                    <span className="color-red">Pending</span>
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="right pr-1 pl-1 top">Refresh:</th>
                                            <td>
                                                { model.refresh }
                                                { user?.role === "admin" && model.refresh !== "none" && model.dataURL && (
                                                    <b className={classList({
                                                        "link ml-1": true,
                                                        "grey-out": refreshing || loading
                                                    })} onClick={refresh}>
                                                        { model.completed ? "Refresh Now" : "Fetch Data" }
                                                        &nbsp;
                                                        <i className={ classList({
                                                            "fa-solid": true,
                                                            "fa-rotate": refreshing || !!model.completed,
                                                            "fa-cloud-arrow-down": !refreshing && !model.completed,
                                                            "fa-spin grey-out": refreshing
                                                        })} />
                                                    </b>
                                                )}
                                                { refreshError && <AlertError>{ refreshError + "" }</AlertError> }
                                            </td>
                                        </tr>
                                    </>
                                }
                                
                                <tr>
                                    <th className="right pr-1 pl-1">Created:</th>
                                    <td><Format value={ model.createdAt } format="date-time" /></td>
                                </tr>
                                { model.dataURL && (
                                    <tr>
                                        <th className="right pr-1 pl-1 top nowrap">Data URL:</th>
                                        <td className="color-muted ellipsis" title={ model.dataURL }>
                                            { model.dataURL }
                                        </td>
                                    </tr>
                                )}
                                { model.Tags && (
                                    <tr>
                                        <th className="right pr-1 pl-1">Tags:</th>
                                        <td>{
                                            model.Tags.length ?
                                                model.Tags.map((t, i) => <Tag tag={t} key={i} />) :
                                                <span className="color-muted">no tag assigned</span>
                                        }</td>
                                    </tr>
                                )}
                                { model.metadata?.total && <tr>
                                    <th className="right pr-1 pl-1 nowrap">Total rows:</th>
                                    <td>{ Number(model.metadata.total).toLocaleString()}</td>
                                </tr>}
                            </tbody>
                        </table>
                    </div>

                    <h5 className="mt-3">Data Elements</h5>
                    <hr/>
                    <ColumnsTable model={model} />
                    {/* { model.requestedData && <div className="mt-2">
                        <Collapse header="Requested Data" collapsed>
                            <div className="row mt-1">
                                <div className="col">
                                    <label>Demographics</label>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "age"        ) ? " fa-square-check color-blue" : " fa-square grey-out") } /> Age</div>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "cdcAgeGroup") ? " fa-square-check color-blue" : " fa-square grey-out") } /> CDC Age Group</div>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "race"       ) ? " fa-square-check color-blue" : " fa-square grey-out") } /> Race</div>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "ethnicity"  ) ? " fa-square-check color-blue" : " fa-square grey-out") } /> Ethnicity</div>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "deceased"   ) ? " fa-square-check color-blue" : " fa-square grey-out") } /> Deceased</div>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "zip"        ) ? " fa-square-check color-blue" : " fa-square grey-out") } /> ZIP Code</div>
                                    <div><i className={ "fa-regular" + (demographics.find(x => x.name === "gender"     ) ? " fa-square-check color-blue" : " fa-square grey-out") } /> Gender</div>
                                </div>
                                <div className="col">
                                    <label>Other</label>
                                    <div><b className={ "badge" + (labs.length          ? " bg-blue" : " grey-out") }>{ labs.length          }</b> Labs</div>
                                    <div><b className={ "badge" + (diagnoses.length     ? " bg-blue" : " grey-out") }>{ diagnoses.length     }</b> Diagnoses</div>
                                    <div><b className={ "badge" + (immunizations.length ? " bg-blue" : " grey-out") }>{ immunizations.length }</b> Immunizations</div>
                                    <div><b className={ "badge" + (medications.length   ? " bg-blue" : " grey-out") }>{ medications.length   }</b> Medications</div>
                                    <div><b className={ "badge" + (procedures.length    ? " bg-blue" : " grey-out") }>{ procedures.length    }</b> Procedures</div>
                                    <div><b className={ "badge" + (phenotypes.length    ? " bg-blue" : " grey-out") }>{ phenotypes.length    }</b> Computable Phenotypes</div>
                                </div>
                            </div>
                        </Collapse>
                    </div> } */}

                    { model.metadata?.type === "flat" && <div className="mt-2"><DataViewer subscription={model} /></div>}
                </div>
                { !isFlatData && 
                    <div className="col col-4 responsive" style={{ minWidth: "20rem" }}>
                        { model.completed && <><h5>Dependent Graphs</h5>
                        <hr/>
                        <ViewsBrowser layout="column" requestId={ model.id } />
                        </> }
                        { model.transmissions && (
                            <>
                                <h5 className="mt-3">Data Transmissions</h5>
                                <hr/>
                                <div className="row gap">
                                    <div className="col mt-1 mb-1">
                                        <TransmissionView
                                            sites={ model.requestedData?.dataSites || [] }
                                            transmissions={ model.transmissions }
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {/* <h5 className="grey-out">Healthcare Sites</h5> */}
                        {/* <SimpleMap center={{ lat: 42.346710208505826, lng: -71.08435192324642 }} zoom={10} /> */}
                        {/* <img src={ map } alt="Sites Map" className="grey-out" /> */}
                        <br/>
                    </div>
                }
            </div>
            <hr className="center mt-1"/>
            <div className="center mt-1 mb-1">
                <a
                    aria-disabled={!model.metadata}
                    className="btn btn-blue pl-1 pr-1 mt-1 mb-1"
                    // https://smart-cumulus.herokuapp.com/requests/undefined/api/requests/10/data?format=csv
                    href={`${process.env.REACT_APP_BACKEND_HOST || ""}/api/requests/${id}/data?format=csv`}>
                    <b> Export Data </b>
                </a>
                { user?.role === "admin" && <Link
                    className="btn btn-blue pl-1 pr-1 m-1"
                    to={`/requests/${model.id}/import`}
                    ><b> Import Data </b></Link>
                }
                { user?.role === "admin" && <Link
                    className="btn btn-blue pl-1 pr-1 mt-1 mb-1"
                    to={`/requests/${model.id}/edit`}
                    ><b> Edit Subscription </b></Link>
                }
            </div>
        </div>
    )
}
