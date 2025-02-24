import { DataPackage }        from "../../Aggregator"
import { app }                from "../../types"
import { humanizeColumnName } from "../../utils"
import Grid                   from "../generic/Grid"
import Prefetch               from "../generic/Prefetch"
import ColumnsTable           from "../Subscriptions/ColumnsTable"
import SubscriptionLink       from "../Subscriptions/SubscriptionLink"


export default function DataPackageView({ pkg }: { pkg: DataPackage }) {

    const cols = Object.keys(pkg.columns).map(name => {
        let type = String(pkg.columns[name])
            .replace("year" , "date:YYYY")
            .replace("month", "date:YYYY-MM")
            .replace("week" , "date:YYYY-MM-DD")
            .replace("day"  , "date:YYYY-MM-DD") as app.supportedDataType;
        return {
            name,
            label      : humanizeColumnName(name),
            description: humanizeColumnName(name),
            dataType   : type
        }
    });

    return (
        <>
            <h1>{ humanizeColumnName(pkg.name) }</h1>
            <hr />
            <table>
                <tbody>
                    <tr>
                        <th className="right nowrap pr-1">Name:</th>
                        <td>{ pkg.name }</td>
                    </tr>
                    <tr>
                        <th className="right nowrap pr-1">ID:</th>
                        <td>{ pkg.id }</td>
                    </tr>
                    <tr>
                        <th className="right nowrap pr-1">Last data update:</th>
                        <td>{ new Date(pkg.last_data_update).toLocaleString() }</td>
                    </tr>
                    <tr>
                        <th className="right nowrap pr-1">Total Rows:</th>
                        <td>{ Number(pkg.total).toLocaleString() }</td>
                    </tr>
                    <tr>
                        <th className="right nowrap pr-1">Study:</th>
                        <td>{ pkg.study }</td>
                    </tr>
                    {/* <tr>
                        <th className="right nowrap pr-1">S3 Path:</th>
                        <td><span className="color-muted" style={{ wordBreak: "break-all" }}>{ pkg.s3_path || "" }</span></td>
                    </tr> */}
                </tbody>
            </table>

            <h5 className="mt-2 color-blue-dark">Columns</h5>
            <hr className="mb-1" />
            <ColumnsTable cols={cols} />

            <h5 className="mt-2 color-blue-dark">Data Sources</h5>
            <hr className="mb-1" />
            <PackageSubscriptionsList pkg={pkg} />
        </>
    )
}

function PackageSubscriptionsList({ pkg }: { pkg: DataPackage }) {
    return (
        <Prefetch path={`/api/requests?where=dataURL:startsWith:${pkg.study}__${pkg.name}`}>
            { (data: app.Subscription[]) => {
                if (!data.length) {
                    return <div className="color-muted mt-05">No Data Sources have been created from this package.</div>
                }
                return (
                    <Grid gap="0 1rem" cols="22em" className="link-list mt-05">
                        { data.map((s, i) => (
                            <SubscriptionLink key={i} request={s} href={"/requests/" + s.id}/>
                        ))}
                    </Grid>
                )
            }}
        </Prefetch>
    )
}
