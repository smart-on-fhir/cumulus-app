import { NavigateFunction } from "react-router"
import { Command }          from "../Command"
import { app }              from "../../types"


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
        return !!this.graphId && !!this.user;
    }

    enabled() {
        return !!this.graphId && !!this.user?.permissions?.includes("Views.create");
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
