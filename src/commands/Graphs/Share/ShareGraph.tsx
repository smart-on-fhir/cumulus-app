import { render }  from "react-dom"
import { app }     from "../../../types"
import { Command } from "../../Command"
import ShareDialog from "./components/ShareDialog"


export class ShareGraph extends Command
{
    private graphId: number
    private user: app.User | null
    
    constructor(graphId: number, user: app.User | null) {
        super()
        this.graphId = graphId
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
        return !!this.graphId && !!this.user;
    }

    enabled() {
        return !!this.graphId && !!this.user?.permissions?.includes("Graphs.create");
    }
    
    execute() {

        render(
            <ShareDialog 
                resource="Graphs"
                resource_id={ [this.graphId] }
                user={ this.user }
            />,
            document.getElementById("modal")!
        )
    }
}
