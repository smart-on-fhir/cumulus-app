const { testCRUDEndpointPermissions, server } = require("../../test-lib");
const DataSites = require("../../fixtures/DataSites")

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