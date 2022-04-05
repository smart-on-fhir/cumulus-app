const express                        = require("express");
const { HttpError }                  = require("httperrors");
const { requireAuth }                = require("./Auth");
const { getFindOptions, assert, rw } = require("../lib");

/**
 * @param {express.Router} router
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param {Object} options
 * @param {boolean} [options.getAll = true] 
 * @param {boolean} [options.getOne = true] 
 * @param {boolean} [options.create = true] 
 * @param {boolean} [options.update = true] 
 * @param {boolean} [options.destroy = true] 
 */
module.exports = function createRestRoutes(router, modelConstructor, {
    getAll  = true,
    getOne  = true,
    create  = true,
    update  = true,
    destroy = true
} = {})
{
    // get all -----------------------------------------------------------------
    if (getAll) {
        router.get("/", rw(async (req, res) => {
            const models = await modelConstructor.findAll(getFindOptions(req));
            res.json(models);
        }));        
    }

    // get one -----------------------------------------------------------------
    if (getOne) {
        router.get("/:id", rw(async (req, res) => {
            const model = await modelConstructor.findByPk(req.params.id, getFindOptions(req))
            assert(model, HttpError.NotFound("Model not found"))
            res.json(model)
        }));
    }

    // Create ------------------------------------------------------------------
    if (create) {
        router.post("/", requireAuth("admin"), express.json({ limit: "60MB" }), rw(async (req, res) => {
            const model = await modelConstructor.create(req.body, { user: req.user });
            res.json(model)
        }));
    }

    // Update ------------------------------------------------------------------
    if (update) {
        router.put("/:id", requireAuth("admin"), express.json({ limit: "60MB" }), rw(async (req, res) => {
            const model = await modelConstructor.findByPk(req.params.id);
            assert(model, HttpError.NotFound("Model not found"))
            await model.update(req.body, { user: req.user });
            res.json(model);
        }));
    }

    // Delete ------------------------------------------------------------------
    if (destroy) {
        router.delete("/:id", requireAuth("admin"), rw(async (req, res) => {
            const model = await modelConstructor.findByPk(req.params.id);
            assert(model, HttpError.NotFound("Model not found"))
            await model.destroy({ user: req.user });
            res.json(model);
        }));
    }
}

