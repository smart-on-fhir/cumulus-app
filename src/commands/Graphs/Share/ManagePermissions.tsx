import { render }        from "react-dom"
import { app }           from "../../../types"
import { Command }       from "../../Command"
import PermissionsDialog from "./components/PermissionsDialog"


export class ManagePermissions extends Command
{
    private graph: Partial<app.View>
    private user: app.User | null
    
    constructor(graph: Partial<app.View>, user: app.User | null) {
        super()
        this.graph = graph
        this.user  = user
    }

    label() {
        return "Manage Graph Permissions"
    }

    description() {
        return "Review and potentially revoke other people's access to this graph"
    }

    icon() {
        return <i className="fas fa-user-shield" />
    }

    available() {
        return !!this.graph.id && !!this.user?.id && (
            this.user.role === "admin" || this.graph.creatorId === this.user.id
        );
    }

    enabled() {
        if (!this.graph.id) {
            return false
        }
        if (!this.user) {
            return false
        }
        if (this.user.role === "admin") {
            return true
        }
        if (this.graph.creatorId === this.user.id) {
            return true
        }
        return false
    }
    
    execute() {
        render(
            <PermissionsDialog resource="Graphs" resource_id={ this.graph.id! } />,
            document.getElementById("modal")!
        )
    }
}
