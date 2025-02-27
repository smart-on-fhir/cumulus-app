import moment                 from "moment"
import { Link }               from "react-router-dom"
import { Site }               from "../../Aggregator"
import { humanizeColumnName } from "../../utils"


export default function SiteView({ site }: { site: Site }) {

    const numStudies = Object.keys(site.studies).length

    let earliest   = Infinity
    let latest     = -Infinity
    let lastUpdate = -Infinity

    for (const study in site.studies) {
        for (const version in site.studies[study]) {
            const period = site.studies[study][version]
            if (period.earliest_date) {
                earliest = Math.min(earliest, moment(period.earliest_date).valueOf())
            }
            if (period.latest_date) {
                latest = Math.max(latest, moment(period.latest_date).valueOf())
            }
            if (period.last_data_update) {
                lastUpdate = Math.max(lastUpdate, moment(period.last_data_update).valueOf())
            }
        }
    }

    return (
        <>
            <h1>
                <i className="material-symbols-outlined mr-05" style={{ verticalAlign: "text-bottom", fontSize: "1.2em" }}>apartment</i>{ site.name }
            </h1>
            <p className="color-muted">Description not available</p>
            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    <h5 className="mt-2">Studies</h5>
                    <hr className="mb-1" />
                    { numStudies > 0 ?
                        Object.keys(site.studies).map(id => {
                            return <div key={id} className="mb-05">
                                <h6>{humanizeColumnName(id)}</h6>
                                { Object.keys(site.studies[id]).map((version, i) => {
                                    return <div key={i}>
                                        <Link to={`/explorer?path=${encodeURIComponent(`/studies/${id}/${version}`)}`} className="link ml-1">
                                            <i className="material-symbols-outlined mr-025" style={{ verticalAlign: "top", lineHeight: "1.3rem", fontSize: "1.4em" }}>history</i>v{version}
                                        </Link>
                                    </div>
                                })}
                            </div>
                        }) :
                        <div className="text-muted">This site is not participating in any studies yet</div>
                    }
                </div>
                <div className="col" style={{ wordBreak: "break-all", minWidth: "15rem" }}>
                    <h5 className="mt-2">Metadata</h5>
                    <hr className="mb-1" />
                    <br />
                    <b>ID</b>
                    <div className="color-muted">{ site.id }</div>

                    { isFinite(earliest) && <>
                        <br />
                        <b>Earliest Data</b>
                        <div className="color-muted">{ new Date(earliest).toLocaleString() }</div>
                    </> }
                    { isFinite(latest) && <>
                        <br />
                        <b>Latest Data: </b>
                        <div className="color-muted">{ new Date(latest).toLocaleString() }</div>
                    </> }
                    { isFinite(lastUpdate) && <>
                        <br />
                        <b>Last Data Update: </b>
                        <div className="color-muted">{ new Date(lastUpdate).toLocaleString() }</div>
                    </> }
                </div>
            </div>
            {/* <pre>{ JSON.stringify(site, null, 4) }</pre> */}
            {/* <h6 className="mt-3">Data Packages <b className="badge">{ 0 }</b></h6>
            <hr className="mb-1"/>
            <div className="text-muted">Data from this site is not included in any data packages yet</div> */}
        </>
    )
}