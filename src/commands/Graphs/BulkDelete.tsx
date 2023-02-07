import { request } from "../../backend"
import { Command }   from "../Command"


export class BulkDelete extends Command
{
    private graphIds: number[]
    private user?: app.User | null
    
    constructor(graphIds: number[], user?: app.User | null) {
        super()
        this.graphIds = graphIds
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
        return this.graphIds.length > 0 && !!this.user;
    }

    enabled() {
        return this.graphIds.length > 0 && !!this.user?.permissions?.includes("Views.delete");
    }
    
    async execute() {
        if (window.confirm("Yre you sure you want to delete these graphs?")) {
            return request(`/api/views?id=${this.graphIds.join(",")}`, { method: "DELETE" }).then(() => {
                window.location.reload()
            })
        }
        return Promise.resolve()
    }
}
