import { expect } from "chai"
import Tags   from "../../fixtures/Tags"
import {
    server,
    resetTable,
    admin,
    testEndpoint
} from "../../test-lib"


describe("Tags", () => {

    beforeEach(async () => await resetTable("Tag", Tags))
    
    describe("list (GET /api/tags)", () => {
        
        testEndpoint("Tags.read", "GET", "/api/tags")

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags?order=x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(500)
        })
    })

    describe("view (GET /api/tags/:id)", () => {
        
        testEndpoint("Tags.read", "GET", "/api/tags/1?creator=true&graphs=true&subscriptions=true");

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/tags/100`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res = await fetch(`${server.baseUrl}/api/tags/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("create (POST /api/tags)", () => {

        testEndpoint("Tags.create", "POST", "/api/tags", { name: "Record name", description: "Record description" })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, {
                method: "POST",
                body: JSON.stringify({ name: "a", description: "" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(400)
        })
    })
    
    describe("update (PUT /api/tags/:id)", () => {

        testEndpoint("Tags.update", "PUT", "/api/tags/1", { name: "Record name 2", description: "Record description 2" })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + admin.sid
                }
            })
            expect(res.status).to.equal(400)
        })
    })
    
    describe("delete (DELETE /api/tags/:id)", () => {

        testEndpoint("Tags.delete", "DELETE", "/api/tags/1")

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/tags/10`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res2 = await fetch(`${server.baseUrl}/api/tags/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
        })
    })

});
