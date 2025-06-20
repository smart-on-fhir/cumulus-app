import ShareDialog           from "./components/ShareDialog"
import { Command }           from "../../Command"
import { app }               from "../../../types"
import { requestPermission } from "../../../utils"
import { modalRoot }         from "../../../roots"


export class CreatePermission extends Command
{
    private user: app.User | null
    private onComplete?: () => void
    
    constructor(user: app.User | null = null, onComplete?: () => void) {
        super()
        this.user = user
        this.onComplete = onComplete
    }

    label() {
        return "Create Permission"
    }

    description() {
        return "Creates permissions"
    }

    icon() {
        return <i className="fas fa-shield" />
    }

    available() {
        return requestPermission({
            user    : this.user,
            resource: "Permissions",
            action  : "create"
        });
    }

    enabled() {
        return true;
    }

    execute() {
        modalRoot.render(
            <ShareDialog resource="" user={ this.user } dialogTitle="Create Permission" onComplete={ this.onComplete } />
        )
    }
}

