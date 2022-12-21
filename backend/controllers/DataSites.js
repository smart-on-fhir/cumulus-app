const express          = require("express");
const Model            = require("../db/models/DataSite").default;
const createRestRoutes = require("./BaseController").default;

const router = module.exports = express.Router({ mergeParams: true });


createRestRoutes(router, Model, {
    getAll : true,
    getOne : true,
    create : true,
    update : true,
    destroy: true
});
