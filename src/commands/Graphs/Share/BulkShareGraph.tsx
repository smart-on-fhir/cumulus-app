import { render }            from "react-dom"
import ShareDialog           from "./components/ShareDialog"
import { Command }           from "../../Command"
import { app }               from "../../../types"
import { requestPermission } from "../../../utils"


export class BulkShareGraph extends Command
{
    private graphs: app.View[]
    private user: app.User | null
    
    constructor({ graphs, user }: { graphs: app.View[], user: app.User | null }) {
        super()
        this.graphs = graphs
        this.user = user
    }

    label() {
        return "Share Selected Graphs"
    }

    description() {
        return "Share these graphs with other Cumulus users"
    }

    icon() {
        return <i className="fas fa-share-alt" />
    }

    available() {
        return !!this.graphs.length && !!this.user;
    }

    enabled() {
        return this.graphs.length > 0 && this.graphs.every(g => {
            if (this.user!.id === g.creatorId) {
                return true
            }
            return requestPermission({
                user: this.user!,
                resource: "Graphs",
                action: "share",
                resource_id: g.id
            })
        });
    }
    
    execute() {
        render(
            <ShareDialog 
                resource="Graphs"
                selectedResources={ [...this.graphs] }
                user={ this.user }
            />,
            document.getElementById("modal")!
        )
    }
}
