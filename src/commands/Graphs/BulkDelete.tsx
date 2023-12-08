import { request }           from "../../backend"
import { Command }           from "../Command"
import { app }               from "../../types"
import { requestPermission } from "../../utils"


export class BulkDelete extends Command
{
    private graphs: Partial<app.View>[]
    private user?: app.User | null
    
    constructor({ graphs, user }: { graphs: Partial<app.View>[], user?: app.User | null }) {
        super()
        this.graphs = graphs
        this.user = user
    }

    label() {
        return "Delete Selected Graphs"
    }

    icon(ctx?: Record<string, any>) {
        return ctx?.working ?
            <i className="fas fa-circle-notch fa-spin" /> :
            <span className="material-icons-round color-red small">clear</span>
    }

    available() {
        return this.graphs.length > 0 && !!this.user;
    }

    enabled() {
        return this.graphs.length > 0 && this.graphs.every(g => {
            if (this.user!.id === g.creatorId) {
                return true
            }
            return requestPermission({
                user: this.user!,
                resource: "Graphs",
                action: "delete",
                resource_id: g.id
            })
        });
    }
    
    async execute() {
        if (window.confirm("Yre you sure you want to delete these graphs?")) {
            return request(`/api/views?id=${this.graphs.map(g => g.id).join(",")}`, { method: "DELETE" }).then(() => {
                window.location.reload()
            })
        }
        return Promise.resolve()
    }
}
