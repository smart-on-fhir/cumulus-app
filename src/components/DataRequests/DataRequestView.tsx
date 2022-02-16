import { useCallback } from "react"
import { useParams }  from "react-router"
import { Link } from "react-router-dom"
import Helmet from "react-helmet"
import { useAuth } from "../../auth"
import { requests }   from "../../backend"
import { useBackend } from "../../hooks"
import Breadcrumbs from "../Breadcrumbs"
import { Format } from "../Format"
import map from "../Home/map.png"
import ViewsBrowser from "../Views/ViewsBrowser"
// import GoogleMapReact from "google-map-react"

// interface SimpleMapProps {
//     center: {
//         lat: number
//         lng: number
//     },
//     zoom: number
// }
// class SimpleMap extends Component<SimpleMapProps> {
  
//     render() {
//       return (
//         // Important! Always set the container height explicitly
//         <div style={{ height: '300px', width: '100%' }}>
//           <GoogleMapReact
//             bootstrapURLKeys={{ key: "AIzaSyAoE75RGPdm1LApIAkCTXtBx6rjsOVaqNA" }}
//             defaultCenter={this.props.center}
//             defaultZoom={this.props.zoom}
//           >
//             <i className="fas fa-map-marker"
//                 style={{
//                     color: "#C00",
//                     fontSize: "30px",
//                     textShadow: "1px 1px 2px #000"
//                 }}
//                 // @ts-ignore
//               lat={42.33732992698751}
//               lng={-71.10595995789029}
//             />
//           </GoogleMapReact>
//         </div>
//       );
//     }
// }

export default function DataRequestView(): JSX.Element
{
    const { id } = useParams()
    const { user } = useAuth();
    const { loading, error, result } = useBackend<app.DataRequest>(
        useCallback(() => requests.getOne(id + "", "?include=group:name"), [id]),
        true
    )

    if (loading) {
        return <b>Loading...</b>
    }

    if (error) {
        return <b>{ error + "" }</b>
    }

    if (!result) {
        return <b>Failed to load DataRequest</b>
    }

    return (
        <div>
            <Helmet>
                <title>Data Request: {result.name}</title>
            </Helmet>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Requests & Subscriptions", href: "/requests" },
                { name: result.name }
            ]}/>
            <h3><i className="fas fa-database" /> { result.name }</h3>
            <p className="color-muted">{ result.description }</p>
            <br/>
            <div className="row gap">
                <div className="col col-6">
                    <h5>Status</h5>
                    <hr className="mb-1"/>
                    <div className="mb-1"><b>Group</b>: { result.group?.name || "GENERAL" }</div>
                    <div className="mb-1"><b>Type</b>: { result.refresh ? "SUBSCRIPTION" : "REQUEST" }</div>
                    <div className="mb-1">
                        <b>Status</b>: {
                            result.completed ?
                            <>completed <Format value={ result.completed } format="date-time" /></> :
                            "Pending"
                        }
                    </div>
                    <div className="mb-1"><b>Created</b>: <Format value={ result.createdAt } format="date-time" /></div>
                    {/* <div className="mb-1"><b>Completed</b>: <Format value={ result.completed } format="date-time" /></div> */}
                    <h5 className="mt-3">Included Fields</h5>
                    <hr/>
                    { result.data ? result.data.cols.map((col, i) => (
                        <div className="mb-1 mt-1" key={i}>
                            <label>{ col.label || col.name }</label> <span className="small color-muted">(<span className={col.dataType}>{ col.dataType }</span>)</span>
                            {/* <div className="small color-muted">
                                <i>Label: </i>{ col.label }                    
                            </div> */}
                            { col.label !== col.name && <div className="small color-muted">
                                <i>Column name: </i><b>{ col.name }</b>
                            </div> }
                            <div className="small color-muted">
                                <i>Description: </i>{ col.description || "No description provided"}
                            </div>
                        </div>
                    )) : <p>No data available yet</p> }
                    <br/>
                </div>
                <div className="col col-4">
                    { result.completed && <><h5>Dependent Views</h5>
                    <hr/>
                    <ViewsBrowser layout="column" requestId={ result.id } />
                    <br/>
                    </> }
                    <h5 className="grey-out">Data Sites</h5>
                    {/* <SimpleMap center={{ lat: 42.346710208505826, lng: -71.08435192324642 }} zoom={10} /> */}
                    <img src={ map } alt="Sites Map" className="grey-out" />
                </div>
            </div>
            <hr className="center mt-1"/>
            <div className="center mt-1 mb-2">
                <a className="btn btn-blue" href={`${process.env.REACT_APP_BACKEND_HOST}/api/requests/${id}/data?format=csv`}><b> Export Data </b></a>
                { user?.role === "admin" && <Link className="btn btn-blue ml-1 mr-1" to={`/requests/${result.id}/import`}><b> Import Data </b></Link> }
                { user?.role === "admin" && <Link className="btn btn-blue" to={`/requests/${result.id}/edit`}><b> Edit this Data Request </b></Link> }
            </div>
        </div>
    )
}