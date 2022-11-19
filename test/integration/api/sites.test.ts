import { testCRUDEndpointPermissions, server } from "../../test-lib"
import DataSites from "../../fixtures/DataSites"


describe("DataSites", () => {
    
    // before(async () => await server.start())

    // after(async () => await server.stop())

    testCRUDEndpointPermissions("/api/data-sites", "DataSite", DataSites, {
        getAll : "data_sites_list",
        getOne : "data_sites_view",
        create : "data_sites_create",
        update : "data_sites_update",
        destroy: "data_sites_delete"
    })
});