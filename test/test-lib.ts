import { Server as HTTPServer }                from "http"
import { Express }                             from "express-serve-static-core"
import { expect }                              from "chai"
import main                                    from "../backend/index"
import Users                                   from "./fixtures/Users"
import Permissions                             from "./fixtures/Permissions"
import { buildPermissionId, fixAutoIncrement } from "../backend/lib"
import setupDB                                 from "../backend/db"
import config                                  from "../backend/config"


export const admin = Users.find(u => u.role === "admin")!

export const manager = Users.find(u => u.role === "manager")!

export const user = Users.find(u => u.role === "user")!

export const recentlyInvitedUser = Users.find(u => u.name === "Recently invited user")!

export const activatedUser = Users.find(u => u.name === "Recently activated user")!

export const expiredUser = Users.find(u => u.name === "Expired user")!

export function getPermissionsForUser({ role, id }: any) {
    return Permissions.filter(x => {
        return x.permission && (
            (x.user_id === id && x.role === null) ||
            (x.user_id === null && x.role === role)
        )
    }).map(buildPermissionId)
}

export function getPermissionsForRole(role: string) {
    switch (role) {
        case "admin":
            return getPermissionsForUser(admin)
        case "manager":
            return getPermissionsForUser(manager)
        case "user":
            return getPermissionsForUser(user)
        default:
            return getPermissionsForUser({ id: -1, role: "guest" })
    }
}

class Server {

    #server: HTTPServer | null = null;

    #app: Express | null = null;

    #baseUrl: string = ""

    get running() {
        return this.#server && this.#server.listening
    }

    get baseUrl() {
        return this.#baseUrl
    }

    /**
     * @returns {express.Application}
     */
    get app(): Express {
        // @ts-ignore
        return this.#app
    }

    async start() {
        try {
            const { server, app } = await main();
            const addr = server.address();
            // @ts-ignore
            this.#baseUrl = `http://${addr.address}:${addr.port}`
            this.#server  = server
            this.#app     = app
        } catch (ex) {
            console.error(ex)
            throw ex
        }
    }

    async stop() {
        return new Promise((resolve, reject) => {
            if (this.#server && this.#server.listening) {
                this.#server.close(error => {
                    if (error) {
                        reject(error)
                    } else {
                        this.#server  = null
                        this.#app     = null
                        this.#baseUrl = ""
                        console.log("Server stopped")
                        resolve(this)
                    }
                })
            } else {
                resolve(this)
            }
        })
    }
};

const SERVER = new Server();

export const server = SERVER

export function getCookie(role: "guest" | "admin" | "manager" | "user" | string) {
    if (role === "guest") {
        return ""
    }
    if (role === "admin") {
        return `sid=${admin.sid}`
    }
    if (role === "manager") {
        return `sid=${manager.sid}`
    }
    if (role === "user") {
        return `sid=${user.sid}`
    }
    return ""
}


export async function resetTable(modelName: string, data: Record<string, any>[]) {
    const dbConnection = await setupDB(config);
    const ModelConstructor = dbConnection.models[modelName]
    await ModelConstructor.sync({ force: true })
    await ModelConstructor.bulkCreate(data, { ignoreDuplicates: true })
    await fixAutoIncrement(dbConnection, ModelConstructor.tableName, "id")
}

export function testEndpoint(permission: string, method: "GET" | "PUT" | "POST" | "DELETE", uri: string, payload?: any) {
    ["guest", "user", "manager", "admin"].forEach(role => {
        const permissions = getPermissionsForRole(role);

        const options: RequestInit = { method }
        const headers: Record<string, any> = {};
        const cookie = getCookie(role)
        if (cookie) {
            headers.cookie = cookie
        }
        if (payload) {
            headers["content-type"] = "application/json"
            options.body = JSON.stringify(payload)
        }
        options.headers = headers

        if (permissions.includes(permission)) {
            it (`${role} can ${method} ${uri}`, async () => {
                const res = await fetch(`${server.baseUrl}${uri}`, options)
                expect(res.status).to.equal(200)
                if (payload) {
                    const json = await res.json()
                    for (const x in payload) {
                        if (!Array.isArray(payload[x])) {
                            expect(json).to.haveOwnProperty(x).that.deep.equals(payload[x])
                        }
                    }
                }
            })
        } else {
            it (`${role} cannot ${method} ${uri}`, async () => {
                const res = await fetch(`${server.baseUrl}${uri}`, options)
                expect(res.status).to.equal(role === "guest" ? 401 : 403)
            })
        }
    })
}

before(async () => await SERVER.start())
after (async () => await SERVER.stop ())

