import { expect } from "chai"
import Tags   from "../../fixtures/Tags"
import {
    server,
    resetTable,
    admin,
    user,
    manager
} from "../../test-lib"


describe("Tags", () => {

    afterEach(async () => await resetTable("Tag", Tags))
    
    describe("list (GET /api/tags)", () => {
        
        it ("guest cannot list tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`)
            expect(res.status).to.equal(401)
        })

        it ("user can list tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, { headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.be.an.instanceOf(Array)
        })

        it ("manager can list tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, { headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.be.an.instanceOf(Array)
        })

        it ("admin can list tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.be.an.instanceOf(Array)
        })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags?order=x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("view (GET /api/tags/:id)", () => {
        
        it ("guest cannot view tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`)
            expect(res.status).to.equal(401)
        })

        it ("user can view tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("manager can view tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("admin can view tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { headers: { Cookie: "sid=" + admin.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/tags/100`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res = await fetch(`${server.baseUrl}/api/tags/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("create (POST /api/tags)", () => {

        it ("guest cannot create tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, { method: "POST" })
            expect(res.status).to.equal(401)
        })

        it ("user cannot create tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, { method: "POST", headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(403)
        })

        it ("manager can create tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, { method: "POST", headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.not.equal(403)
        })

        it ("admin can create tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags`, {
                method: "POST",
                body: JSON.stringify({ name: "Record name", description: "Record description" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("name").that.equals("Record name")
            expect(json).to.haveOwnProperty("description").that.equals("Record description")
            expect(json).to.haveOwnProperty("creatorId").that.equals(admin.id)
        })

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

        it ("guest cannot update tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "whatever" }),
                headers: {
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(401)
        })

        it ("user cannot update tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "whatever" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + user.sid
                }
            })
            expect(res.status).to.equal(403)
        })

        it ("manager can update tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "whatever" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + manager.sid
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("description").that.equals("whatever")
        })

        it ("admin can update tag", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "whatever" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + admin.sid
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("description").that.equals("whatever")
        })

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

        it ("guest cannot delete tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { method: "DELETE" });
            expect(res.status).to.equal(401);
        })

        it ("user cannot delete tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { method: "DELETE", headers: { Cookie: "sid=" + user.sid }})
            expect(res.status).to.equal(403)
        })

        it ("manager can delete tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { method: "DELETE", headers: { Cookie: "sid=" + manager.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("admin can delete tags", async () => {
            const res = await fetch(`${server.baseUrl}/api/tags/1`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/tags/10`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)

            const res2 = await fetch(`${server.baseUrl}/api/tags/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
        })
    })

});
