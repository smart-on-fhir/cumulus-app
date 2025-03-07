import { DataPackage }        from "../../Aggregator"
import Terminology            from "../../Terminology"
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
            <h1>
                <i className="material-symbols-outlined mr-05" style={{ verticalAlign: "text-bottom", fontSize: "1.2em" }}>deployed_code</i>
                { humanizeColumnName(pkg.name) }
            </h1>
            <p className="color-muted">Description not available</p>
            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    <h5 className="mt-2">Columns</h5>
                    <hr className="mb-1" />
                    <ColumnsTable cols={cols} />
                    <h5 className="mt-2">{Terminology.subscription.namePlural}</h5>
                    <hr className="mb-1" />
                    <PackageSubscriptionsList pkg={pkg} />
                    {/* <h5 className="mt-2 color-blue-dark">Generic Data Views</h5>
                    <hr className="mb-1" />
                    TODO... */}
                </div>
                <div className="col" style={{ wordBreak: "break-all", minWidth: "16rem" }}>
                    <h5 className="mt-2">Metadata</h5>
                    <hr className="mb-1" />
                    <br />
                    <b>Name</b>
                    <div className="color-muted">{ pkg.name }</div>
                    <br />
                    <b>ID</b>
                    <div className="color-muted">{ pkg.id }</div>
                    <br />
                    <b>Last Data Update</b>
                    <div className="color-muted">{ new Date(pkg.last_data_update).toLocaleString() }</div>
                    <br />
                    <b>Total Rows</b>
                    <div className="color-muted">{ Number(pkg.total).toLocaleString() }</div>
                    <br />
                    <b>Study</b>
                    <div className="color-muted">{ pkg.study }</div>
                    <br />
                    <b>Version</b>
                    <div className="color-muted">{ pkg.version }</div>
                    <br />
                    <b>Type</b>
                    <div className="color-muted">{ pkg.type || "cube" }</div>
                    {/* <br />
                    <b>S3 Path</b>
                    <div>{ pkg.s3_path || "" }</div> */}
                </div>
            </div>
        </>
    )
}

function PackageSubscriptionsList({ pkg }: { pkg: DataPackage }) {
    return (
        <Prefetch path={`/api/requests?where=dataURL:startsWith:${pkg.study}__${pkg.name}`}>
            { (data: app.Subscription[]) => {
                if (!data.length) {
                    return <div className="color-muted mt-05">No {Terminology.subscription.namePlural} have been created from this package.</div>
                }
                return (
                    <Grid gap="0 1rem" cols="18em" className="link-list mt-05">
                        { data.map((s, i) => (
                            <SubscriptionLink key={i} request={s} href={"/requests/" + s.id}/>
                        ))}
                    </Grid>
                )
            }}
        </Prefetch>
    )
}
