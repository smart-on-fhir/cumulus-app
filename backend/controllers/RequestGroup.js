const express           = require("express");
const RequestGroupModel = require("../db/models/RequestGroup");
const createRestRoutes  = require("./BaseController");

const router = module.exports = express.Router({ mergeParams: true });


createRestRoutes(router, RequestGroupModel);
