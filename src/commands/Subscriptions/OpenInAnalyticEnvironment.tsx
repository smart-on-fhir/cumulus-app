import { Command }           from "../Command"
import { app }               from "../../types"
import { requestPermission } from "../../utils"


export class OpenInAnalyticEnvironment extends Command
{
    private subscriptionId?: number
    private user?: app.User | null
    
    constructor(subscriptionId: number, user?: app.User | null) {
        super()
        this.subscriptionId = subscriptionId
        this.user = user
    }

    label() {
        return "Open in Analytic Environment"
    }

    description() {
        return "Open this Data Source in external analytic environment"
    }

    icon() {
        return <span className="material-icons-round">launch</span>
    }

    available() {
        return (
            !!this.subscriptionId &&
            !!this.user &&
            !!process.env.REACT_APP_NOTEBOOK_URL
        );
    }

    enabled() {
        return (
            !!this.subscriptionId &&
            !!process.env.REACT_APP_NOTEBOOK_URL &&
            requestPermission({
                user       : this.user,
                resource   : "Subscriptions",
                resource_id: this.subscriptionId,
                action     : "export"
            })
        );
    }
    
    execute() {
        const url = new URL(process.env.REACT_APP_NOTEBOOK_URL!)
        url.searchParams.set("fileLoc", window.location.origin + "/api/requests/" + this.subscriptionId + "/data?format=csv")
        window.open(url.href, "_blank")
    }
}
