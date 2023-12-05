import { NavigateFunction } from "react-router"
import { Command }          from "../Command"
import { app }              from "../../types"
import { requestPermission } from "../../utils"


export class CopyGraph extends Command
{
    private graphId?: number
    private user?: app.User | null
    private navigate?: NavigateFunction
    private view?: Partial<app.View>
    
    constructor(graphId: number, user?: app.User | null, navigate?: NavigateFunction, view?: Partial<app.View>) {
        super()
        this.graphId = graphId
        this.user = user
        this.navigate = navigate
        this.view = view
    }

    label() {
        return "Duplicate Graph"
    }

    description() {
        return "Create a copy of this graph to modify and save it later"
    }

    icon() {
        return <i className="fa-regular fa-copy" />
    }

    available() {
        return (
            // Not available for guests
            !!this.user

            // Not available for charts that are not saved yet
            && !!this.graphId

            // Not available for those who can't create charts
            && requestPermission({
                user     : this.user,
                resource : "Graphs",
                action   : "create"
            })

            // Not available for those who can't read this chart
            && requestPermission({
                user       : this.user,
                resource   : "Graphs",
                resource_id: this.graphId,
                action     : "read"
            })
        );
    }

    enabled() {
        return true
    }
    
    execute() {
        setTimeout(() => {
            if (this.navigate) {
                this.navigate(`/views/${this.graphId}/copy`, { state: { view: this.view }, replace: false })
            } else {
                const url = new URL(`/views/${this.graphId}/copy`, window.location.origin)
                window.location.href = url.href
            }
        })
    }
}
