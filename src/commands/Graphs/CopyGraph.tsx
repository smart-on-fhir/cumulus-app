import { NavigateFunction }  from "react-router-dom"
import { Command }           from "../Command"
import { app }               from "../../types"
import { requestPermission } from "../../utils"


export class CopyGraph extends Command
{
    /**
     * The Graph we want to copy
     */
    private view: Partial<app.View>

    /**
     * The current user. Note that we accept null for guests but this will never
     * happen in reality because this command is not used in publicly available
     * locations.
     */
    private user?: app.User | null
    
    /**
     * The navigate function. If not provided, normal window.location navigation
     * will be performed
     */
    private navigate?: NavigateFunction

    /**
     * What we want to copy. This basically `this.view` with some modifications.
     * This is used to inject the runtime state if the command is invoked from
     * the chart edit page and we also wanna copy any unsaved runtime changes.
     */
    private payload?: Partial<app.View>
    
    constructor(view: Partial<app.View>, user: app.User | null, navigate?: NavigateFunction, payload?: Partial<app.View>) {
        super()
        this.view     = view
        this.user     = user
        this.navigate = navigate
        this.payload  = payload
    }

    label() {
        return "Duplicate Graph"
    }

    description() {
        return "Create a copy of this graph to modify and save it later"
    }

    icon() {
        return <i className="fa-regular fa-copy" />
    }

    available() {
        return (
            // Not available for guests
            !!this.user

            // Not available for charts that are not saved yet
            && !!this.view.id

            && (this.view.creatorId === this.user.id || (

                // Not available for those who can't create charts
                requestPermission({
                    user     : this.user,
                    resource : "Graphs",
                    action   : "create"
                })

                // Not available for those who can't read this chart
                && requestPermission({
                    user       : this.user,
                    resource   : "Graphs",
                    resource_id: this.view.id,
                    action     : "read"
                })
            ))
        );
    }

    enabled() {
        return true
    }
    
    execute() {
        setTimeout(() => {
            const path = `/${this.view.isDraft ? "drafts" : "views"}/${this.view.id}/copy`
            if (this.navigate) {
                if (this.payload) {
                    this.navigate(path, { state: { view: this.payload }, replace: false })
                } else {
                    this.navigate(path, { replace: false })
                }
            } else {
                const url = new URL(path, window.location.origin)
                window.location.href = url.href
            }
        })
    }
}
