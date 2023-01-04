import Views                        from "../../fixtures/Views"
import { resetTable, testEndpoint } from "../../test-lib"


describe("Graphs", () => {
    
    beforeEach(async () => await resetTable("View", Views))

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
                settings: {}
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
                settings: {}
            }
        )
    })

    describe("delete", () => {
        testEndpoint("Views.delete", "DELETE", "/api/views/1")
    })
});