import { useCallback, useState }  from "react"
import { useParams }              from "react-router"
import { Link }                   from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { useAuth }                from "../../auth"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import Breadcrumbs                from "../generic/Breadcrumbs"
import { Format }                 from "../Format"
import ViewsBrowser               from "../Views/ViewsBrowser"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import { classList, humanizeColumnName } from "../../utils"
import Tag                        from "../Tags/Tag"
import TransmissionView           from "./Transmissions/TransmissionView"
import { app }                    from "../../types"


export default function DataRequestView(): JSX.Element
{
    const { id } = useParams()
    const { user } = useAuth();

    const { loading, error, result: model, execute: fetch } = useBackend<app.DataRequest>(
        useCallback(() => request("/api/requests/" + id + "?group=true&graphs=true&tags=true"), [id]),
        true
    )

    const {
        loading: refreshing,
        error  : refreshError,
        execute: refresh
    } = useBackend(
        useCallback(() => request<app.DataRequest>(`/api/requests/${id}/refresh`).then(fetch), [id, fetch])
    );

    if (loading && !model) {
        return <Loader/>
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    if (!model) {
        return <AlertError>Failed to load DataRequest</AlertError>
    }

    // const requestedData = model.requestedData || {
    //     dataSites: [],
    //     fields: {
    //         demographics : [],
    //         diagnoses    : [],
    //         immunizations: [],
    //         labs         : [],
    //         medications  : [],
    //         phenotypes   : [],
    //         procedures   : []
    //     }
    // };
    
    // const {
    //     demographics,
    //     diagnoses,
    //     immunizations,
    //     labs,
    //     medications,
    //     phenotypes,
    //     procedures
    // } = requestedData.fields;

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
            <p className="color-muted" dangerouslySetInnerHTML={{ __html: model.description || "" }}/>
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
                                {/* <tr><th className="right pr-1 pl-1">Type:</th><td>{ model.refresh === "manually" ? "REQUEST" : "SUBSCRIPTION" }</td></tr> */}
                                <tr><th className="right pr-1 pl-1">Status:</th><td>{
                                        model.completed ?
                                        <>completed <Format value={ model.completed } format="date-time" /></> :
                                        <span className="color-red">Pending</span>
                                    }
                                </td></tr>
                                <tr>
                                    <th className="right pr-1 pl-1 top">Refresh:</th>
                                    <td>
                                        { model.refresh }
                                        { user?.role === "admin" && model.refresh !== "none" && model.dataURL && (
                                            <b className={classList({
                                                "link ml-1": true,
                                                "grey-out": refreshing || loading
                                            })} onClick={refresh}>
                                                { model.data ? "Refresh Now" : "Fetch Data" }
                                                &nbsp;
                                                <i className={ classList({
                                                    "fa-solid": true,
                                                    "fa-rotate": refreshing || !!model.data,
                                                    "fa-cloud-arrow-down": !refreshing && !model.data,
                                                    "fa-spin grey-out": refreshing
                                                })} />
                                            </b>
                                        )}
                                        { refreshError && <AlertError>{ refreshError + "" }</AlertError> }
                                    </td>
                                </tr>
                                <tr><th className="right pr-1 pl-1">Created:</th><td><Format value={ model.createdAt } format="date-time" /></td></tr>
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

                    <h5 className="mt-3">Included Fields</h5>
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
                </div>
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

function ColumnsTable({ model }: { model: app.DataRequest })
{
    if (!model.metadata?.cols?.length) {
        return <p className="col col-10 color-muted">No data available yet</p>
    }

    return (
        <table className="columns-table">
            <tbody>
                <tr>
                    <th>Variable Name</th>
                    <th>Description</th>
                </tr>
                { model.metadata?.cols.map((col, i) => <ColumnsTableItem key={i} col={col}/>) }
            </tbody>
        </table>
    )
}

function ColumnsTableItem({ col }: { col: app.DataRequestDataColumn })
{
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr>
                <td className="col-name" onClick={() => setOpen(!open)}>
                    <span className="arrow">{ open ? "▿" : "▹" }</span> <img src="/icons/column.png" alt="icon" width="16" style={{ verticalAlign: "middle" }}/> { humanizeColumnName(col.name) }
                </td>
                <td className="col-description">{ col.meta?.display || col.description || "No description provided" }</td>
            </tr>
            { open && <tr>
                <td colSpan={2} className="col-details">
                    { col.meta?.datatype && <div>
                            <label>FHIR Type:</label> { col.meta.datatype }
                        </div>}
                        <div>
                            <label>Data Type:</label> <span className={col.dataType}>
                                { col.dataType }
                            </span>
                        </div>
                        { col.meta?.system && <div>
                            <label>System:</label> { col.meta.system }
                        </div>}
                        { col.meta?.values && <div>
                            <label>Values:</label> <CoddingValuesTable values={col.meta.values} />
                        </div> }
                </td>
            </tr> }
        </>
    )
}


interface CoddingValue {
    code   : string
    display: string
    system?: string
}

function CoddingValuesTable({
    values
}: {
    values: CoddingValue | CoddingValue[]
})
{
    if (!Array.isArray(values)) {
        return <CoddingValueTable value={values} />
    }

    const limit = 10;
    const remainder = Math.max(values.length - limit, 0);
    const rows = remainder ? values.slice(0, limit) : values;
    return (
        <table className="nowrap">
            <tr className="color-muted">
                <th>Code</th>
                <th>Display</th>
                <th>{ rows.some(v => !!v.system) && "System" }</th>
            </tr>
            { rows.map((x, i) => (
                <tr key={i}>
                    <td className="color-green nowrap"><b>{ x.code }</b></td>
                    <td>{ x.display }</td>
                    <td>{ x.system && <a href={x.system} target="_blank" rel="noreferrer noopener" className="link">{x.system.split("/").pop()}</a> }</td>
                </tr>
            )) }
            { remainder > 0 && <tr>
                <td colSpan={3}>
                    <hr style={{ height: 1 }} />
                    <div className="color-muted">{remainder} more values not shown...</div>
                </td>
            </tr>}
        </table>
    )
}

function CoddingValueTable({ value }: { value: CoddingValue })
{
    return (
        <table className="nowrap">
            <tr className="color-muted">
                <th>Code</th>
                <th>Display</th>
                <th>{ !!value.system && "System" }</th>
            </tr>
            <tr>
                <td className="color-green nowrap"><b>{ value.code }</b></td>
                <td>{ value.display }</td>
                <td>{
                    value.system &&
                    <a href={value.system} target="_blank" rel="noreferrer noopener" className="link">{value.system.split("/").pop()}</a>
                }</td>
            </tr>
        </table>
    )
}
