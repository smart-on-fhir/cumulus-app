import { Link } from "react-router-dom"
import { Format } from "../Format"

function Icon(props: { type: "ok"|"pending"|"working" }) {
    return (
        <div className="icon">
            <i className="fa-solid fa-database"/>
            { props.type === "pending" && <i className="fas fa-clock"/> }
            { props.type === "working" && <i className="fas fa-sync-alt"/> }
            { props.type === "ok" && <i className="fas fa-check-circle"/> }
        </div>
    )
}

export default function DataRequestLink({
    request,
    href = "/requests/:id"
}: {
    request: app.DataRequest,
    href?: string
}) {

    let type = request.refresh === "manually" ? "REQUEST" : "SUBSCRIPTION"
    let info = null
    let iconType: "ok"|"pending"|"working" = "ok"
    if (!request.completed) {
        info = <div className="color-muted small">PENDING {type}</div>
        iconType = "pending"
    }
    else if (request.refresh) {
        info = (<div className="color-muted small">
            SUBSCRIPTION (Last refreshed on <Format value={request.completed} format="date" />)
        </div>)
        iconType = "working"
    }
    else {
        info = (<div className="color-muted small">
            Completed <Format value={request.completed} format="date" />
        </div>)
        iconType = "ok"
    }

    return (
        <Link to={ href.replace(":id", request.id + "") } className="icon-item" title={ request.description }>
            <Icon type={iconType} />
            { request.name }&nbsp;
            {info}
        </Link>
    )
}