import { NavigateFunction }  from "react-router-dom"
import { deleteOne }         from "../../backend"
import { Command }           from "../Command"
import { app }               from "../../types"
import { requestPermission } from "../../utils"


export class DeleteGraph extends Command
{
    private graphId?: number
    private ownerId?: number | null
    private user?: app.User | null
    private navigate?: NavigateFunction
    
    constructor({ graphId, ownerId, user, navigate }: {
        graphId  : number,
        ownerId ?: number | null,
        user    ?: app.User | null,
        navigate?: NavigateFunction
    }) {
        super()
        this.graphId  = graphId
        this.ownerId  = ownerId
        this.user     = user
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

    description(ctx?: Record<string, any>) {
        return ctx?.working ?
            "Please wait while this graph is being deleted..." :
            "Delete this Graph"
    }

    available() {
        return !!this.graphId && !!this.user;
    }

    enabled() {
        const isOwner = this.user && this.user.id === this.ownerId
        return isOwner || (!!this.graphId && requestPermission({
            user       : this.user,
            resource   : "Graphs",
            resource_id: this.graphId,
            action     : "delete"
        }));
    }
    
    async execute() {
        if (window.confirm("Yre you sure you want to delete this view?")) {
            return deleteOne("views", this.graphId + "").then(() => {
                setTimeout(() => {
                    const match = window.location.pathname.match(/\/(views|my\/drafts)\/\d+/)
                    if (match && match[1]) {
                        if (this.navigate) {
                            this.navigate("/" + match[1])
                        } else {
                            window.location.href = window.location.origin + "/" + match[1]
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