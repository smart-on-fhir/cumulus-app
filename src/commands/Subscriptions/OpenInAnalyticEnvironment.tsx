import { Command }  from "../Command"


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
        return "Open this subscription data in external analytic environment"
    }

    icon() {
        return <span className="material-icons-round">launch</span>
    }

    available() {
        return !!this.subscriptionId && !!this.user;
    }

    enabled() {
        return (
            !!this.subscriptionId &&
            !!this.user?.permissions?.includes("DataRequests.export")
        );
    }
    
    execute() {
        const url = new URL("https://cumulusdemo.notebook.us-east-1.sagemaker.aws/notebooks/cumulus/demo.ipynb")
        url.searchParams.set("fileLoc", window.location.origin + "/api/requests/" + this.subscriptionId + "/data?format=csv")
        window.open(url.href, "_blank")
    }
}
