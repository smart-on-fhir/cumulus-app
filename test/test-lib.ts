import { Server as HTTPServer } from "http"
import { Express }              from "express-serve-static-core"
import { expect }               from "chai"
import { Sequelize }            from "sequelize"
import main                     from "../backend/index"
import { ACL, roles }           from "../backend/acl"
import Users                    from "./fixtures/Users"
import { fixAutoIncrement }     from "../backend/lib"

type Action = keyof typeof ACL
type Role   = keyof typeof roles


export const admin = Users.find(u => u.role === "admin")!

export const manager = Users.find(u => u.role === "manager")!

export const user = Users.find(u => u.role === "user")!

export const recentlyInvitedUser = Users.find(u => u.name === "Recently invited user")!

export const activatedUser = Users.find(u => u.name === "Recently activated user")!

export const expiredUser = Users.find(u => u.name === "Expired user")!


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

function getCookie(role: "guest" | "admin" | "manager" | "user" | string) {
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

export function testCRUDEndpointPermissions(mountPoint: string, modelName: string, data: Record<string, any>[], {
    getAll  = "",
    getOne  = "",
    create  = "",
    update  = "",
    destroy = ""
}: {
    getAll ?: string,
    getOne ?: string
    create ?: string
    update ?: string
    destroy?: string
}) {

    describe("ACL tests for " + mountPoint, () => {
    
        afterEach(async () => await resetTable(modelName, data))

        if (getAll) {
            for (const role in roles) {
                const allowed = !!ACL[getAll as Action][roles[role as Role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to GET ${mountPoint}`, async () => {
                    const headers: Record<string, any> = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}`, { headers })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (getOne) {
            for (const role in roles) {
                const allowed = !!ACL[getOne as Action][roles[role as Role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to GET ${mountPoint}/1`, async () => {
                    const headers: Record<string, any> = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}/1`, { headers })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (create) {
            for (const role in roles) {
                const allowed = !!ACL[create as Action][roles[role as Role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to POST ${mountPoint}`, async () => {
                    const headers: Record<string, any> = { "content-type": "application/json" };
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}`, {
                        method: "POST",
                        body: "{}",
                        headers
                    })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (update) {
            for (const role in roles) {
                const allowed = !!ACL[update as Action][roles[role as Role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to PUT ${mountPoint}/1`, async () => {
                    const headers: Record<string, any> = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}/1`, { method: "PUT", headers })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (destroy) {
            for (const role in roles) {
                const allowed = !!ACL[destroy as Action][roles[role as Role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to DELETE ${mountPoint}/1`, async () => {
                    const headers: Record<string, any> = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}/1`, { method: "DELETE", headers })
                    // console.log(res.status, await res.text())
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }
    })
}

export async function resetTable(modelName: string, data: Record<string, any>[]) {
    const dbConnection: Sequelize = SERVER.app.get("dbConnection")
    const ModelConstructor = dbConnection.models[modelName]
    await ModelConstructor.sync({ force: true })
    await ModelConstructor.bulkCreate(data)
    await fixAutoIncrement(dbConnection, ModelConstructor.tableName, "id")
}

before(async function() {
    this.timeout(30000)
    return await SERVER.start()
})

after(async () => await SERVER.stop())

