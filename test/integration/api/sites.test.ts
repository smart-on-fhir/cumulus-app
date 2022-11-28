// import { expect }                   from "chai"
import DataSites                    from "../../fixtures/DataSites"
import { resetTable, testEndpoint } from "../../test-lib"


describe("DataSites", () => {
    
    beforeEach(async () => await resetTable("DataSite", DataSites))

    describe("list", () => {
        testEndpoint("DataSites.read", "GET", "/api/data-sites")
    })

    describe("view", () => {
        testEndpoint("DataSites.read", "GET", "/api/data-sites/1")
    })

    describe("create", () => {
        testEndpoint("DataSites.create", "POST", "/api/data-sites", { name: "Record name", description: "Record description" })
    })

    describe("update", () => {
        testEndpoint("DataSites.update", "PUT", "/api/data-sites/1", { name: "Record name 2", description: "Record description 2" })
    })

    describe("delete", () => {
        testEndpoint("DataSites.delete", "DELETE", "/api/data-sites/1")
    })
});