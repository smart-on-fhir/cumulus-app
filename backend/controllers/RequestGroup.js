const Model = require("../db/models/RequestGroup")
const createRestRouter = require("./BaseController") 

module.exports = createRestRouter(Model);
