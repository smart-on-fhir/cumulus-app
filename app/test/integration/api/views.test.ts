import Views                        from "../../fixtures/Views"
import DataRequests                 from "../../fixtures/DataRequests"
import { resetTable, testEndpoint } from "../../test-lib"


describe("Graphs", () => {
    
    beforeEach(async () => {
        await resetTable("DataRequest", DataRequests)
        await resetTable("View", Views)
    })

    describe("list", () => {
        testEndpoint("Views.read", "GET", "/api/views?order=name:asc")
    })

    describe("view", () => {
        testEndpoint("Views.read", "GET", "/api/views/1?tags=true")
    })

    describe("create", () => {
        testEndpoint(
            "Views.create",
            "POST",
            "/api/views",
            {
                name: "Record name",
                description: "Record description",
                DataRequestId: 1,
                settings: {},
                Tags: [{ id: 1 }]
            }
        )
    })

    describe("update", () => {
        testEndpoint(
            "Views.update",
            "PUT",
            "/api/views/1",
            {
                name: "Record name 2",
                description: "Record description 2",
                DataRequestId: 1,
                settings: {},
                Tags: [{ id: 2 }]
            }
        )
    })

    describe("delete", () => {
        testEndpoint("Views.delete", "DELETE", "/api/views/1")
    })
});