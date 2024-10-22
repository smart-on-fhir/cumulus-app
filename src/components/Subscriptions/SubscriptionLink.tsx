import { useEffect, useState }              from "react"
import { Link }                             from "react-router-dom"
import { Format }                           from "../Format"
import { highlight }                        from "../../utils"
import { app }                              from "../../types"
import { useCommand }                       from "../../hooks"
import { humanizePackageId, useAggregator } from "../../Aggregator"
import { ToggleFavorite }                   from "../../commands/ToggleFavorite"


function Icon({ subscription }: { subscription: app.Subscription }) {

    const { dataURL } = subscription

    const [version, setVersion] = useState<string | null>(null)

    const { aggregator, status } = useAggregator()
    
    useEffect(() => {
        if (dataURL) {
            aggregator.getLatestPackageId(dataURL).catch(() => "").then(setVersion)
        }
    }, [dataURL])

    if (dataURL && status === "connected" && version !== null && version !== dataURL) {
        if (version === "") {
            return <span className="material-symbols-outlined color-red" data-tooltip="Remote data package not found!">database_off</span>
        }
        return <span className="material-symbols-outlined color-orange"
            data-tooltip={ `<div class="center">Subscription can be upgraded to package <b>${humanizePackageId(version)}</b></div>` }>database_upload</span>
    }

    if (subscription.metadata?.type === "flat") {
        return <span className="material-symbols-outlined color-blue">table</span>
    }

    if (dataURL) {
        return <span className="material-symbols-outlined color-blue">database</span>
    }

    if (subscription.completed) {
        return <span className="material-symbols-outlined color-blue">news</span>
    }
    
    return <span className="material-symbols-outlined">overview</span>
}

export default function SubscriptionLink({
    request,
    href = "/requests/:id",
    search
}: {
    request: app.Subscription,
    href?: string
    search?: string
}) {

    const { status } = useAggregator()

    const id = request.id + ""
    const ToggleFavoriteCmd = new ToggleFavorite(id, "starredSubscriptions")
    const toggleFavorite    = useCommand(ToggleFavoriteCmd)
    const on = ToggleFavoriteCmd.on()

    return (
        <Link
            to={ href.replace(":id", id) }
            className="icon-item"
            aria-disabled={ !!request.dataURL && status !== "connected" }
            onContextMenu={e => {
                // @ts-ignore
                e.nativeEvent.menuItems = [toggleFavorite]
            }}>
            <div className="icon">
                <Icon subscription={request} />
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
