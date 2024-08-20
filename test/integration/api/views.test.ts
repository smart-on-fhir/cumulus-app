import { expect }                   from "chai"
import Views                        from "../../fixtures/Views"
import Subscriptions                from "../../fixtures/Subscriptions"
import { admin, resetTable, server, testEndpoint } from "../../test-lib"


describe("Graphs", () => {
    
    beforeEach(async () => {
        await resetTable("Subscription", Subscriptions)
        await resetTable("View", Views)
    })

    describe("list", () => {
        testEndpoint("Graphs.read", "GET", "/api/views?order=name:asc", null, true)
    })

    describe("view", () => {
        testEndpoint("Graphs.read", "GET", "/api/views/1?tags=true&group=true&study_areas=true&subscription=true")
        
        it("get the screenshot", async () => {
            const res = await fetch(`${server.baseUrl}/api/views/1/screenshot`, { headers: { Cookie: "sid=" + admin.sid } })
            expect(res.status).to.equal(200)
            expect(res.headers.get('content-type')).to.match(/^image\/.+/)
        })

        it("get the screenshot", async () => {
            const res = await fetch(`${server.baseUrl}/api/views/2/screenshot`, { headers: { Cookie: "sid=" + admin.sid } })
            expect(res.status).to.equal(200)
            expect(res.headers.get('content-type')).to.match(/^image\/png/)
            expect(res.headers.get('content-length')).to.equal('4023')
        })

        it("get the screenshot 2", async () => {
            const res = await fetch(`${server.baseUrl}/api/views/3/screenshot`, { headers: { Cookie: "sid=" + admin.sid } })
            expect(res.status).to.equal(400)
            expect(await res.text()).to.equal("Invalid base64 image data")
        })
    })

    describe("create", () => {
        testEndpoint(
            "Graphs.create",
            "POST",
            "/api/views",
            {
                name: "Record name",
                description: "Record description",
                subscriptionId: 1,
                settings: {},
                Tags: [{ id: 1 }]
            }
        )
    })

    describe("update", () => {
        testEndpoint(
            "Graphs.update",
            "PUT",
            "/api/views/1",
            {
                name: "Record name 2",
                description: "Record description 2",
                subscriptionId: 1,
                settings: {},
                Tags: [{ id: 2 }]
            }
        )
    })

    it("errors on update", async () => {
        const res = await fetch(`${server.baseUrl}/api/views/1`, {
            method : "PUT",
            body   : JSON.stringify({ name: null }),
            headers: {
                Cookie: "sid=" + admin.sid,
                "content-type": "application/json"
            }
        })
        expect(res.status).to.equal(500)
    })

    describe("delete", () => {
        testEndpoint("Graphs.delete", "DELETE", "/api/views/1")

        it ("bulk delete", async () => {
            const res = await fetch(`${server.baseUrl}/api/views/?id=1,2,3`, {
                method : "DELETE",
                headers: { Cookie: "sid=" + admin.sid }
            })
            expect(res.status).to.equal(200)
        })
    })
});