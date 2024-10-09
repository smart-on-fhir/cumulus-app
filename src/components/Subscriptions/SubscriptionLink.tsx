import { Link }      from "react-router-dom"
import { highlight } from "../../utils"
import { Format }    from "../Format"
import { app }       from "../../types"
import { ToggleFavorite } from "../../commands/ToggleFavorite"
import { useCommand } from "../../hooks"


export default function SubscriptionLink({
    request,
    href = "/requests/:id",
    search
}: {
    request: app.Subscription,
    href?: string
    search?: string
}) {

    const id = request.id + ""
    const ToggleFavoriteCmd = new ToggleFavorite(id, "starredSubscriptions")
    const toggleFavorite    = useCommand(ToggleFavoriteCmd)
    const on = ToggleFavoriteCmd.on()

    return (
        <Link to={ href.replace(":id", id) } className="icon-item" onContextMenu={e => {
            // @ts-ignore
            e.nativeEvent.menuItems = [toggleFavorite]
        }}>
            <div className="icon">
                { request.metadata?.type === "flat" ?
                    <span className="material-symbols-outlined color-blue">table</span> :
                    !!request.dataURL ?
                        <span className="material-symbols-outlined color-blue">database</span> :
                        request.completed ?
                            <span className="material-symbols-outlined color-blue">news</span> :
                            <span className="material-symbols-outlined">overview</span> }
                { on && <i className="fa-solid fa-star star"/> }
            </div>
            <b className="nowrap">
                <span className="wrap">{ search ? highlight(request.name, search) : request.name }</span>
            </b>
            <div className="color-muted small">
                { request.completed ? <>Data updated: <Format value={request.completed} format="date" /></> : "No data yet" }
            </div>
        </Link>
    )
}
