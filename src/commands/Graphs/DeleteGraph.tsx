import { NavigateFunction } from "react-router"
import { deleteOne } from "../../backend"
import { Command }   from "../Command"


export class DeleteGraph extends Command
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
        return "Delete This Graph"
    }

    icon(ctx?: Record<string, any>) {
        return ctx?.working ?
            <i className="fas fa-circle-notch fa-spin" /> :
            <i className="fas fa-trash-alt color-red" />
    }

    available() {
        return !!this.graphId && !!this.user;
    }

    enabled() {
        return !!this.graphId && !!this.user?.permissions?.includes("Views.delete");
    }
    
    async execute() {
        if (window.confirm("Yre you sure you want to delete this view?")) {
            return deleteOne("views", this.graphId + "").then(() => {
                setTimeout(() => {
                    const onChartPage = window.location.pathname.match(/\/views\/\d+/)
                    if (onChartPage) {
                        if (this.navigate) {
                            this.navigate("/views")
                        } else {
                            window.location.href = window.location.origin + "/views"
                        }
                    } else {
                        window.location.reload()
                    }
                })
            })
        }
        return Promise.resolve()
    }
}