import { CurrentUser } from "./types";

const SystemUser: CurrentUser = {
    id   : 0,
    email: "system@cumulus.org",
    role : "system",
    permissions: {}
}

export default SystemUser
