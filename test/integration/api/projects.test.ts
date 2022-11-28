import { expect } from "chai"
import Projects   from "../../fixtures/Projects"
import {
    server,
    resetTable,
    admin,
    testEndpoint
} from "../../test-lib"


describe("Projects", () => {

    afterEach(async () => await resetTable("Project", Projects))
    
    describe("list (GET /api/projects)", () => {

        testEndpoint("Projects.read", "GET", "/api/projects")
        
        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects?order=x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("view (GET /api/projects/:id)", () => {
        
        testEndpoint("Projects.read", "GET", "/api/projects/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/projects/100`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res = await fetch(`${server.baseUrl}/api/projects/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("create (POST /api/projects)", () => {

        testEndpoint("Projects.create", "POST", "/api/projects", { name: "Project name", description: "Project description" })

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

        testEndpoint("Projects.update", "PUT", "/api/projects/1", { name: "Project name 2", description: "Project description 2" })

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
        
        testEndpoint("Projects.delete", "DELETE", "/api/projects/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/projects/10`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res2 = await fetch(`${server.baseUrl}/api/projects/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
        })
    })

});
