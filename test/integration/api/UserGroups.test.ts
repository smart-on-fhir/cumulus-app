import UserGroups from "../../fixtures/UserGroups"
import { resetTable, admin, testEndpoint, manager, user } from "../../test-lib"


describe("UserGroups", () => {

    beforeEach(async () => await resetTable("UserGroup", UserGroups))
    
    describe("list (GET /api/user-groups)", () => {
        testEndpoint("UserGroups.read", "GET", "/api/user-groups")
    })

    describe("view (GET /api/user-groups/:id)", () => {
        testEndpoint("UserGroups.read", "GET", "/api/user-groups/1?users=true");
    })

    describe("create (POST /api/user-groups)", () => {
        testEndpoint("UserGroups.create", "POST", "/api/user-groups", { name: "Group 1", description: "Group 1 description", users: [admin, manager] })
    })
    
    describe("update (PUT /api/user-groups/:id)", () => {
        testEndpoint("UserGroups.update", "PUT", "/api/user-groups/1", { name: "Group 1 2", description: "Record description 1 2", users: [admin, user] })
    })
    
    describe("delete (DELETE /api/user-groups/:id)", () => {
        testEndpoint("UserGroups.delete", "DELETE", "/api/user-groups/1")
    })

});
