import { Link }      from "react-router-dom"
import { highlight } from "../../utils"
import { Format }    from "../Format"
import { app }       from "../../types"
import { ToggleFavorite } from "../../commands/ToggleFavorite"
import { useCommand } from "../../hooks"

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
    href = "/requests/:id",
    search
}: {
    request: app.DataRequest,
    href?: string
    search?: string
}) {

    const id = request.id + ""
    const ToggleFavoriteCmd = new ToggleFavorite(id, "starredSubscriptions")
    const toggleFavorite    = useCommand(ToggleFavoriteCmd)
    const on = ToggleFavoriteCmd.on()

    
    // let type = request.refresh === "manually" ? "REQUEST" : "SUBSCRIPTION"
    let info = null
    let iconType: "ok"|"pending"|"working" = "ok"
    
    if (!request.completed) {
        info = <div className="color-muted small">PENDING SUBSCRIPTION</div>
        iconType = "pending"
    }
    
    else if ([/*"none", "manually", */"daily", "weekly", "monthly", "yearly"].includes(request.refresh)) {
        info = (<div className="color-muted small">
            Last refreshed on <Format value={request.completed} format="date" />
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
        <Link to={ href.replace(":id", id) } className="icon-item" onContextMenu={e => {
            // @ts-ignore
            e.nativeEvent.menuItems = [toggleFavorite]
        }}>
            <Icon type={iconType} />
            <b className="nowrap">{
                on && <i className="fa-solid fa-star star"/> } <span className="wrap">{ search ? highlight(request.name, search) : request.name }</span></b>&nbsp;
            {info}
        </Link>
    )
}
