const express           = require("express");
const RequestGroupModel = require("../db/models/RequestGroup");
const createRestRoutes  = require("./BaseController");

const router = module.exports = express.Router({ mergeParams: true });


createRestRoutes(router, RequestGroupModel, {
    getAll : "request_groups_list",
    getOne : "request_groups_view",
    create : "request_groups_create",
    update : "request_groups_update",
    destroy: "request_groups_delete"
});
