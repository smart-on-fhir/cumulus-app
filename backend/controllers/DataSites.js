const express          = require("express");
const Model            = require("../db/models/DataSite");
const createRestRoutes = require("./BaseController");

const router = module.exports = express.Router({ mergeParams: true });


createRestRoutes(router, Model, {
    getAll : "data_sites_list",
    getOne : "data_sites_view",
    create : "data_sites_create",
    update : "data_sites_update",
    destroy: "data_sites_delete"
});
