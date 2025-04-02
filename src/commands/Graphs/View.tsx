import { NavigateFunction } from "react-router-dom"
import { Command }          from "../Command"
import { app }              from "../../types"


export class View extends Command
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
        return "View Graph"
    }

    description() {
        return "View and/or edit this graph"
    }

    icon() {
        return <span className="material-icons-round">visibility</span>
    }

    available() {
        return !!this.graphId && !!this.user && !window.location.pathname.match(/^\/views\/\d+$/);
    }

    enabled() {
        // If we have been able to see the thumbnail, than we should also be
        // able to view the graph
        return this.available();
    }
    
    execute() {
        setTimeout(() => {
            if (this.navigate) {
                this.navigate(`/views/${this.graphId}`)
            } else {
                const url = new URL(`/views/${this.graphId}`, window.location.origin)
                window.location.href = url.href
            }
        })
    }
}
