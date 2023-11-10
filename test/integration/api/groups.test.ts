import RequestGroups                from "../../fixtures/RequestGroups"
import { resetTable, testEndpoint } from "../../test-lib"


describe("SubscriptionGroups", () => {
    
    beforeEach(async () => await resetTable("RequestGroup", RequestGroups))

    describe("list", () => {
        testEndpoint("SubscriptionGroups.read", "GET", "/api/request-groups?subscriptions=true")
    })

    describe("view", () => {
        testEndpoint("SubscriptionGroups.read", "GET", "/api/request-groups/1?subscriptions=true")
    })

    describe("create", () => {
        testEndpoint("SubscriptionGroups.create", "POST", "/api/request-groups", { name: "Record name", description: "Record description" })
    })

    describe("update", () => {
        testEndpoint("SubscriptionGroups.update", "PUT", "/api/request-groups/1", { name: "Record name 2", description: "Record description 2" })
    })

    describe("delete", () => {
        testEndpoint("SubscriptionGroups.delete", "DELETE", "/api/request-groups/1")
    })
});