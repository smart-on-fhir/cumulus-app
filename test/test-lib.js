const http                 = require("http")
const express              = require("express")
const { expect }           = require("chai")
const { Sequelize }        = require('sequelize')
const main                 = require("../backend/index")
const { ACL, roles }       = require("../backend/acl")
const Users                = require("./fixtures/Users")
const { fixAutoIncrement } = require("../backend/lib")

/** @type any */
const admin = Users.find(u => u.role === "admin");

/** @type any */
const manager = Users.find(u => u.role === "manager");

/** @type any */
const user = Users.find(u => u.role === "user");

/** @type any */
const recentlyInvitedUser = Users.find(u => u.name === "Recently invited user");

/** @type any */
const activatedUser = Users.find(u => u.name === "Recently activated user");

/** @type any */
const expiredUser = Users.find(u => u.name === "Expired user");


class Server {

    /**
     * @type {http.Server | null}
     */
    #server = null;

    /**
     * @type {express.Application | null}
     */
    #app = null;

    /**
     * @type {string}
     */
    #baseUrl = ""

    get running() {
        return this.#server && this.#server.listening
    }

    get baseUrl() {
        return this.#baseUrl
    }

    /**
     * @returns {express.Application}
     */
    get app() {
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

function getCookie(role) {
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

/**
 * @param {string} mountPoint 
 * @param {string} modelName 
 * @param {object[]} data
 * @param {object} actions
 */
function testCRUDEndpointPermissions(mountPoint, modelName, data, {
    getAll  = "",
    getOne  = "",
    create  = "",
    update  = "",
    destroy = ""
}) {

    describe("ACL tests for " + mountPoint, () => {
    
        afterEach(async () => await resetTable(modelName, data))

        if (getAll) {
            for (const role in roles) {
                const allowed = !!ACL[getAll][roles[role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to GET ${mountPoint}`, async () => {
                    const headers = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}`, { headers })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (getOne) {
            for (const role in roles) {
                const allowed = !!ACL[getOne][roles[role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to GET ${mountPoint}/1`, async () => {
                    const headers = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}/1`, { headers })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (create) {
            for (const role in roles) {
                const allowed = !!ACL[create][roles[role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to POST ${mountPoint}`, async () => {
                    const headers = { "content-type": "application/json" };
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
                const allowed = !!ACL[update][roles[role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to PUT ${mountPoint}/1`, async () => {
                    const headers = {};
                    const cookie = getCookie(role)
                    if (cookie) headers.cookie = cookie
                    const res = await fetch(`${SERVER.baseUrl}${mountPoint}/1`, { method: "PUT", headers })
                    expect(res.status === 403).to.equal(!allowed)
                })
            }
        }

        if (destroy) {
            for (const role in roles) {
                const allowed = !!ACL[destroy][roles[role]];
                it (`${allowed ? "Allows" : "Does NOT allow"} "${role}" to DELETE ${mountPoint}/1`, async () => {
                    const headers = {};
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

/**
 * @param {string} modelName 
 * @param {object[]} data
 */
async function resetTable(modelName, data) {
    /** @type {Sequelize} */
    const dbConnection = SERVER.app.get("dbConnection")
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

module.exports = {
    server: SERVER,
    testCRUDEndpointPermissions,
    resetTable,
    admin,
    manager,
    user,
    recentlyInvitedUser,
    activatedUser,
    expiredUser
};
