import { Link } from "react-router-dom";
import { Site } from "../../Aggregator";
import { humanizeColumnName } from "../../utils";
import moment from "moment";

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
            <hr />
            <table>
                <tbody>
                    <tr>
                        <th className="right pr-1 pl-1 nowrap">ID: </th>
                        <td width={"70%"}>{ site.id }</td>
                    </tr>
                    { isFinite(earliest) && <tr>
                        <th className="right pr-1 pl-1 nowrap">Earliest Data: </th>
                        <td>{ new Date(earliest).toLocaleString() }</td>
                    </tr> }
                    { isFinite(latest) && <tr>
                        <th className="right pr-1 pl-1 nowrap">Latest Data: </th>
                        <td>{ new Date(latest).toLocaleString() }</td>
                    </tr> }
                    { isFinite(lastUpdate) && <tr>
                        <th className="right pr-1 pl-1 nowrap">Last Data Update: </th>
                        <td>{ new Date(lastUpdate).toLocaleString() }</td>
                    </tr> }
                </tbody>
            </table>
            {/* <pre>{ JSON.stringify(site, null, 4) }</pre> */}

            <h5 className="mt-3">Studies <b className="badge">{ numStudies }</b></h5>
            <hr className="mb-1"/>
            { numStudies > 0 ?
                Object.keys(site.studies).map(id => {
                    const versions = Object.keys(site.studies[id]).length
                    return <div key={id}>
                        <i className="material-symbols-outlined mr-05" style={{ verticalAlign: "top", lineHeight: "1.3rem", fontSize: "1.4em" }}>experiment</i>
                        <Link to={`/explorer?path=%2Fstudies%2F${id}`} className="link">
                            {humanizeColumnName(id)}
                        </Link><span className="color-muted" style={{ fontWeight: 400 }}> - { versions } version{ versions === 1 ? "" : "s" }</span>
                        {/* <ul className="ml-1">
                            { Object.keys(site.studies[id]).map((version, i) => {
                                return <li key={i}>
                                    v{version}
                                </li>
                            })}
                            
                        </ul> */}
                    </div>
                }) :
                <div className="text-muted">This site is not participating in any studies yet</div>
            }
            
            

            {/* <h6 className="mt-3">Data Packages <b className="badge">{ 0 }</b></h6>
            <hr className="mb-1"/>
            <div className="text-muted">Data from this site is not included in any data packages yet</div> */}
        </>
    )
}