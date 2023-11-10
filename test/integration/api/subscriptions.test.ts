import { expect }                from "chai"
import setupDB                   from "../../../backend/db"
import config                    from "../../../backend/config"
import DataRequests              from "../../fixtures/DataRequests"
import Tags                      from "../../fixtures/Tags"
import {
    getCookie,
    resetTable,
    getPermissionsForRole,
    server,
    testEndpoint
} from "../../test-lib"


describe("Subscriptions", () => {
    
    beforeEach(async () => {
        await resetTable("Tag", Tags)
        await resetTable("DataRequest", DataRequests)

        const dbConnection = await setupDB(config);

        await dbConnection.query(`DROP table if exists "subscription_data_1"`)
        await dbConnection.query(
            `CREATE table "subscription_data_1" (
                "cnt" Integer,
                "gender" Text
            )`
        )
        await dbConnection.query(
            `INSERT INTO "subscription_data_1" ("gender", "cnt") VALUES
            ('M', 100), ('F', 200), (NULL, 300)`
        )
    })

    describe("list", () => {
        testEndpoint("Subscriptions.read", "GET", "/api/requests")
    })

    describe("view", () => {
        testEndpoint("Subscriptions.read", "GET", "/api/requests/1?group=true&tags=true&graphs=true")
    })

    describe("create", () => {
        testEndpoint(
            "Subscriptions.create",
            "POST",
            "/api/requests",
            {
                name: "Record name",
                description: "Record description",
                Tags: [{ id: 1 }]
            }
        )
    })

    describe("update", () => {
        testEndpoint(
            "Subscriptions.update",
            "PUT",
            "/api/requests/1",
            {
                name: "Record name 2",
                description: "Record description 2",
                Tags: [{ id: 1 }]
            }
        )
    })

    describe("delete", () => {
        testEndpoint("Subscriptions.delete", "DELETE", "/api/requests/1")
    })

    describe("by-group", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.read")) {
                it (`${role} can read subscriptions by group`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/by-group?requestLimit=2`, options);
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot read subscriptions by group`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/by-group`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })
    })

    describe("get subscription graphs", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.read") && permissions.includes("Graphs.read")) {
                it (`${role} can read subscription graphs`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/views`, options);
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot read subscription graphs`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/views`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })
    })

    describe("export subscription data", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.export")) {
                it (`${role} can export subscription data`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/data?inline=true`, options);
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot export subscription data`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/data?inline=true`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })
    })

    describe.skip("refresh subscription data", () => {
        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role);
    
            const options: RequestInit = { method: "GET" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            options.headers = headers
    
            if (permissions.includes("Subscriptions.refresh")) {
                it (`${role} can refresh subscription data`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, options)
                    expect(res.status).to.equal(200)
                })
            } else {
                it (`${role} cannot refresh subscription data`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/requests/1/refresh`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })
    })
});