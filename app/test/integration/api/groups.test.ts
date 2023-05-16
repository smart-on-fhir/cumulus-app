import RequestGroups                from "../../fixtures/RequestGroups"
import { resetTable, testEndpoint } from "../../test-lib"


describe("RequestGroups", () => {
    
    beforeEach(async () => await resetTable("RequestGroup", RequestGroups))

    describe("list", () => {
        testEndpoint("RequestGroups.read", "GET", "/api/request-groups?subscriptions=true")
    })

    describe("view", () => {
        testEndpoint("RequestGroups.read", "GET", "/api/request-groups/1?subscriptions=true")
    })

    describe("create", () => {
        testEndpoint("RequestGroups.create", "POST", "/api/request-groups", { name: "Record name", description: "Record description" })
    })

    describe("update", () => {
        testEndpoint("RequestGroups.update", "PUT", "/api/request-groups/1", { name: "Record name 2", description: "Record description 2" })
    })

    describe("delete", () => {
        testEndpoint("RequestGroups.delete", "DELETE", "/api/request-groups/1")
    })
});