import { NavigateFunction }  from "react-router-dom"
import { Command }           from "../Command"
import { app }               from "../../types"
import { requestPermission } from "../../utils"


export class RequestLineLevelData extends Command
{
    private graphId?: number
    private user?: app.User | null
    private navigate?: NavigateFunction
    
    constructor(graphId: number, user?: app.User | null, navigate?: NavigateFunction) {
        super()
        this.graphId = graphId
        this.user = user
        this.navigate = navigate
    }

    label() {
        return <>Request Line Level Data <span className="color-muted">(future)</span>...</>
    }

    description() {
        return "Send us a request for line-level data"
    }

    icon() {
        return <span className="material-icons-round">cloud_download</span>
    }

    available() {
        return !!this.graphId && !!this.user;
    }

    enabled() {
        return (
            requestPermission({
                user       : this.user,
                resource   : "Graphs",
                resource_id: this.graphId,
                action     : "read"
            })
            && requestPermission({
                user       : this.user,
                resource   : "Subscriptions",
                action     : "requestLineLevelData"
            })
        );
    }
    
    execute() {
        if (this.navigate) {
            this.navigate(`/views/${this.graphId}/request-data`)
        } else {
            const url = new URL(`/views/${this.graphId}/request-data`, window.location.origin)
            window.location.href = url.href
        }
    }
}
