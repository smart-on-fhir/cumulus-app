const express          = require("express");
const Model            = require("../db/models/DataSite");
const createRestRoutes = require("./BaseController");

const router = module.exports = express.Router({ mergeParams: true });


createRestRoutes(router, Model);
