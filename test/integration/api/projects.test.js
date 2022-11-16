const { expect } = require("chai");
const Projects = require("../../fixtures/Projects");
const {
    server,
    resetTable,
    admin,
    user,
    manager
} = require("../../test-lib");



describe("Projects", () => {

    afterEach(async () => await resetTable("Project", Projects))
    
    describe("list (GET /api/projects)", () => {
        
        it ("guest cannot list projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`)
            expect(res.status).to.equal(403)
        })

        it ("user can list projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, { headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.be.an.instanceOf(Array)
        })

        it ("manager cannot list projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, { headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.be.an.instanceOf(Array)
        })

        it ("admin can list projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.be.an.instanceOf(Array)
        })

        it ("handles bad parameter errors", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects?order=x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal("Error reading projects")
        })
    })

    describe("view (GET /api/projects/:id)", () => {
        
        it ("guest cannot view project", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`)
            expect(res.status).to.equal(403)
        })

        it ("user can view project", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("manager can view project", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("admin can view project", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { headers: { Cookie: "sid=" + admin.sid } })
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/projects/100`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)
            expect(await res1.text()).to.equal("Project not found")

            const res = await fetch(`${server.baseUrl}/api/projects/x`, { headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(400)
        })
    })

    describe("create (POST /api/projects)", () => {

        it ("guest cannot create projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, { method: "POST" })
            expect(res.status).to.equal(401)
        })

        it ("user cannot create projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, { method: "POST", headers: { Cookie: "sid=" + user.sid } })
            expect(res.status).to.equal(403)
        })

        it ("manager can create projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, { method: "POST", headers: { Cookie: "sid=" + manager.sid } })
            expect(res.status).to.not.equal(403)
        })

        it ("admin can create projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects`, {
                method: "POST",
                body: JSON.stringify({ name: "Project 3", description: "whatever" }),
                headers: {
                    Cookie: "sid=" + admin.sid,
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(200)
            const json = await res.json()
            expect(json).to.haveOwnProperty("name").that.equals("Project 3")
            expect(json).to.haveOwnProperty("description").that.equals("whatever")
            expect(json).to.haveOwnProperty("creatorId").that.equals(admin.id)
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

        it ("guest cannot update projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "whatever" }),
                headers: {
                    "content-type": "application/json"
                }
            })
            expect(res.status).to.equal(403)
        })

        it ("user cannot update projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, {
                method: "PUT",
                body: JSON.stringify({ description: "whatever" }),
                headers: {
                    "content-type": "application/json",
                    Cookie: "sid=" + user.sid
                }
            })
            expect(res.status).to.equal(403)
        })

        it ("manager can update projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, {
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

        it ("admin can update projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, {
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

        it ("guest cannot delete projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { method: "DELETE" });
            expect(res.status).to.equal(403);
        })

        it ("user cannot delete projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { method: "DELETE", headers: { Cookie: "sid=" + user.sid }})
            expect(res.status).to.equal(403)
        })

        it ("manager can delete projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { method: "DELETE", headers: { Cookie: "sid=" + manager.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("admin can delete projects", async () => {
            const res = await fetch(`${server.baseUrl}/api/projects/1`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res.status).to.equal(200)
            expect(await res.json()).to.haveOwnProperty("id").that.equals(1)
        })

        it ("handles bad parameter errors", async () => {
            const res1 = await fetch(`${server.baseUrl}/api/projects/10`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res1.status).to.equal(404)
            expect(await res1.text()).to.equal("Project not found")

            const res2 = await fetch(`${server.baseUrl}/api/projects/x`, { method: "DELETE", headers: { Cookie: "sid=" + admin.sid }})
            expect(res2.status).to.equal(400)
        })
    })

});
