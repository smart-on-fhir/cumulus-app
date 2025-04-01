import { createRoot }        from "react-dom/client"
import ShareDialog           from "./components/ShareDialog"
import { Command }           from "../../Command"
import { app }               from "../../../types"
import { requestPermission } from "../../../utils"


export class ShareGraph extends Command
{
    private graph: Partial<app.View>
    private user: app.User | null
    
    constructor(graph: Partial<app.View>, user: app.User | null) {
        super()
        this.graph = graph
        this.user = user
    }

    label() {
        return "Share Graph"
    }

    description() {
        return "Share this graph with other Cumulus users"
    }

    icon() {
        return <i className="fas fa-share-alt" />
    }

    available() {
        return !!this.graph.id && !!this.user;
    }

    enabled() {
        if (!this.graph.id) { // unsaved charts
            return false
        }
        if (this.graph.creatorId && this.user && this.graph.creatorId === this.user.id) { // my charts
            return true
        }
        return requestPermission({
            user       : this.user,
            resource_id: this.graph.id!,
            resource   : "Graphs",
            action     : "share"
        });
    }
    
    execute() {
        createRoot(document.getElementById("modal")!).render(
            <ShareDialog 
                resource="Graphs"
                selectedResources={ [this.graph] }
                user={ this.user }
            />
        )
    }
}
