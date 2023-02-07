import { NavigateFunction } from "react-router"
import { Command }  from "../Command"


export class CopyGraph extends Command
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
        return "Copy Chart"
    }

    description() {
        return "Create a copy of this chart to modify and save it later"
    }

    icon() {
        return <i className="fa-regular fa-copy color-blue-dark" />
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
                this.navigate(`/views/${this.graphId}/copy`)
            } else {
                const url = new URL(`/views/${this.graphId}/copy`, window.location.origin)
                window.location.href = url.href
            }
        })
    }
}
