import { expect }                from "chai"
import StudyAreas                from "../../fixtures/StudyAreas"
import Subscriptions             from "../../fixtures/Subscriptions"
import {
    server,
    resetTable,
    admin,
    testEndpoint,
    getCookie,
    getPermissionsForRole
} from "../../test-lib"


describe("StudyAreas", () => {

    afterEach(async () => await resetTable("StudyArea", StudyAreas))
    
    describe("list (GET /api/study-areas)", () => {

        testEndpoint("StudyAreas.read", "GET", "/api/study-areas")
        
        // it ("handles bad parameter errors", async () => {
        //     const res = await fetch(`${server.baseUrl}/api/study-areas?order=x`, { headers: { Cookie: "sid=" + admin.sid }})
        //     expect(res.status).to.equal(400)
        // })
    })

    describe("view (GET /api/study-areas/:id)", () => {
        
        testEndpoint("StudyAreas.read", "GET", "/api/study-areas/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/study-areas/100`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res = await fetch(`${server.baseUrl}/api/study-areas/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("create (POST /api/study-areas)", () => {

        testEndpoint("StudyAreas.create", "POST", "/api/study-areas", { name: "Study Area name", description: "Study Area description" });
        // testEndpoint("StudyAreas.create", "POST", "/api/study-areas", { name: "Study Area name", description: "Study Area description", Subscriptions });

        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role as any);
    
            const options: RequestInit = { method: "POST" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            headers["content-type"] = "application/json"
            options.body = JSON.stringify({ name: "Record name", description: "Record description", Subscriptions: Subscriptions.map(s => s.id) })
            options.headers = headers
    
            if (permissions.includes("Tags.create")) {
                it (`${role} can create study-areas with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/study-areas`, options)
                    expect(res.status).to.equal(200)
                    const json = await res.json()
                    expect(json).to.include({ name: "Record name", description: "Record description" })
                    expect(json).to.haveOwnProperty("Subscriptions").that.is.an("array")
                })
            } else {
                it (`${role} cannot create study-areas with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/study-areas`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/study-areas`, {
                method: "POST",
                body: JSON.stringify({ field: "value" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
        })
    })
    
    describe("update (PUT /api/study-areas/:id)", () => {

        testEndpoint("StudyAreas.update", "PUT", "/api/study-areas/1", { name: "Study Area name 2", description: "Study Area description 2" });

        ["guest", "user", "manager", "admin"].forEach(role => {
            const permissions = getPermissionsForRole(role as any);
    
            const options: RequestInit = { method: "PUT" }
            const headers: Record<string, any> = {};
            const cookie = getCookie(role)
            if (cookie) {
                headers.cookie = cookie
            }
            headers["content-type"] = "application/json"
            options.body = JSON.stringify({ name: "Record name 2", description: "Record description 2", Subscriptions: Subscriptions.map(s => s.id) })
            options.headers = headers
    
            if (permissions.includes("Tags.update")) {
                it (`${role} can update study-areas with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/study-areas/1`, options)
                    expect(res.status).to.equal(200)
                    const json = await res.json()
                    expect(json).to.include({ name: "Record name 2", description: "Record description 2" })
                    expect(json).to.haveOwnProperty("Subscriptions").that.is.an("array")
                })
            } else {
                it (`${role} cannot update study-areas with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/study-areas/1`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/study-areas/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + admin.sid
                }
            })
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("Error updating Study Area")
        })
    })
    
    describe("delete (DELETE /api/study-areas/:id)", () => {
        
        testEndpoint("StudyAreas.delete", "DELETE", "/api/study-areas/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/study-areas/10`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res2 = await fetch(`${server.baseUrl}/api/study-areas/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
        })
    })

});