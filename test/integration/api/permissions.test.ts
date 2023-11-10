import { expect }                           from "chai"
import Permissions                          from "../../fixtures/Permissions"
import { resetTable, server, testEndpoint } from "../../test-lib"

describe("Permissions", () => {
        
    beforeEach(async () => await resetTable("Permission", Permissions))

    describe("list", () => {
        testEndpoint("Permissions.read", "GET", "/api/permissions")
    })

    describe("view", () => {
        testEndpoint("Permissions.read", "GET", "/api/permissions/1")
    })

    it ("create is not implemented", async () => {
        const res = await fetch(`${server.baseUrl}/api/permissions`, { method: "POST" })
        expect(res.status).to.equal(404)
    })

    it ("update is not implemented", async () => {
        const res = await fetch(`${server.baseUrl}/api/permissions`, { method: "PUT" })
        expect(res.status).to.equal(404)
    })

    it ("delete is not implemented", async () => {
        const res = await fetch(`${server.baseUrl}/api/permissions`, { method: "DELETE" })
        expect(res.status).to.equal(404)
    })
});