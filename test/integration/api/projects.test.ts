import { expect }                from "chai"
import Projects                  from "../../fixtures/Projects"
import Subscriptions             from "../../fixtures/DataRequests"
import {
    server,
    resetTable,
    admin,
    testEndpoint,
    getCookie,
    getPermissionsForRole
} from "../../test-lib"


describe("Projects", () => {

    afterEach(async () => await resetTable("Project", Projects))
    
    describe("list (GET /api/projects)", () => {

        testEndpoint("StudyAreas.read", "GET", "/api/projects")
        
        // it ("handles bad parameter errors", async () => {
        //     const res = await fetch(`${server.baseUrl}/api/projects?order=x`, { headers: { Cookie: "sid=" + admin.sid }})
        //     expect(res.status).to.equal(400)
        // })
    })

    describe("view (GET /api/projects/:id)", () => {
        
        testEndpoint("StudyAreas.read", "GET", "/api/projects/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/projects/100`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res = await fetch(`${server.baseUrl}/api/projects/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("create (POST /api/projects)", () => {

        testEndpoint("StudyAreas.create", "POST", "/api/projects", { name: "Project name", description: "Project description" });
        // testEndpoint("Projects.create", "POST", "/api/projects", { name: "Project name", description: "Project description", Subscriptions });

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
                it (`${role} can create projects with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/projects`, options)
                    expect(res.status).to.equal(200)
                    const json = await res.json()
                    expect(json).to.include({ name: "Record name", description: "Record description" })
                    expect(json).to.haveOwnProperty("Subscriptions").that.is.an("array")
                })
            } else {
                it (`${role} cannot create projects with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/projects`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, {
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
    
    describe("update (PUT /api/projects/:id)", () => {

        testEndpoint("StudyAreas.update", "PUT", "/api/projects/1", { name: "Project name 2", description: "Project description 2" });

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
                it (`${role} can update projects with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/projects/1`, options)
                    expect(res.status).to.equal(200)
                    const json = await res.json()
                    expect(json).to.include({ name: "Record name 2", description: "Record description 2" })
                    expect(json).to.haveOwnProperty("Subscriptions").that.is.an("array")
                })
            } else {
                it (`${role} cannot update projects with subscriptions`, async () => {
                    const res = await fetch(`${server.baseUrl}/api/projects/1`, options)
                    expect(res.status).to.equal(role === "guest" ? 401 : 403)
                })
            }
        })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + admin.sid
                }
            })
            expect(res.status).to.equal(400)
            // expect(await res.text()).to.equal("Error updating project")
        })
    })
    
    describe("delete (DELETE /api/projects/:id)", () => {
        
        testEndpoint("StudyAreas.delete", "DELETE", "/api/projects/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/projects/10`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res2 = await fetch(`${server.baseUrl}/api/projects/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
        })
    })

});