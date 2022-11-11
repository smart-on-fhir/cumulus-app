const express                        = require("express");
const { HttpError }                  = require("httperrors");
const { requestPermission }          = require("./Auth");
const { getFindOptions, assert, rw } = require("../lib");
const { ACL }                        = require("../acl");

/**
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param { keyof ACL } permission
 */
function createGetAllHandler(modelConstructor, permission) {
    
    /**
     * @param {import("../../index").app.UserRequest} req
     * @param {import("express").Response} res
     */
    return async function getAll(req, res) {
        requestPermission(permission, req);
        try {
            const models = await modelConstructor.findAll(getFindOptions(req));
            res.json(models);
        } catch(error) {
            throw new HttpError.InternalServerError(
                `Error reading ${modelConstructor.name} models`
            );
        }
    }
}

/**
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param { keyof ACL } permission
 */
function createGetOneHandler(modelConstructor, permission) {
    
    /**
     * @param {import("../../index").app.UserRequest} req
     * @param {import("express").Response} res
     */
    return async function getOne(req, res) {
        requestPermission(permission, req);
        const model = await modelConstructor.findByPk(req.params.id)
        assert(model, HttpError.NotFound(`${modelConstructor.name} not found`))
        res.json(model)
    }
}

/**
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param { keyof ACL } permission
 */
function createCreateHandler(modelConstructor, permission) {
    
    /**
     * @param {import("../../index").app.UserRequest} req
     * @param {import("express").Response} res
     */
    return async function create(req, res) {
        requestPermission(permission, req);
        try {
            const model = await modelConstructor.create(req.body);
            res.json(model)
        } catch (error) {
            throw new HttpError.InternalServerError(`Error creating ${modelConstructor.name}`);
        }
    }
}

/**
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param { keyof ACL } permission
 */
function createUpdateHandler(modelConstructor, permission) {
    
    /**
     * @param {import("../../index").app.UserRequest} req
     * @param {import("express").Response} res
     */
    return async function update(req, res) {
        requestPermission(permission, req);

        const model = await modelConstructor.findByPk(req.params.id);
        assert(model, new HttpError.NotFound(`${modelConstructor.name} not found`));
        
        try {
            await model.update(req.body, { user: req.user });
            res.json(model);
        }
        catch(error) {
            throw new HttpError.BadRequest(`Error updating ${modelConstructor.name}`);
        }
    }
}

/**
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param { keyof ACL } permission
 */
function createDeleteHandler(modelConstructor, permission) {
    
    /**
     * @param {import("../../index").app.UserRequest} req
     * @param {import("express").Response} res
     */
    return async function destroy(req, res) {
        requestPermission(permission, req);

        const model = await modelConstructor.findByPk(req.params.id);
        assert(model, new HttpError.NotFound(`${modelConstructor.name} not found`));
        
        try {
            await model.destroy({ user: req.user });
            res.json(model);
        }
        catch(error) {
            throw new HttpError.BadRequest(`Error deleting ${modelConstructor.name}`);
        }
    }
}


/**
 * @param {express.Router} router
 * @param {import("sequelize").ModelStatic<any>} modelConstructor
 * @param {Object} options
 * @param {keyof ACL} [options.getAll] 
 * @param {keyof ACL} [options.getOne] 
 * @param {keyof ACL} [options.create] 
 * @param {keyof ACL} [options.update] 
 * @param {keyof ACL} [options.destroy] 
 */
module.exports = function createRestRoutes(router, modelConstructor, {
    getAll,
    getOne,
    create,
    update,
    destroy
} = {})
{
    if (getAll) {
        router.get("/", rw(createGetAllHandler(modelConstructor, getAll)));
    }

    if (getOne) {
        router.get("/:id", rw(createGetOneHandler(modelConstructor, getOne)));
    }

    if (create) {
        router.post("/", express.json({ limit: "60MB" }), rw(createCreateHandler(modelConstructor, create)));
    }

    if (update) {
        router.put("/:id", express.json({ limit: "60MB" }), rw(createUpdateHandler(modelConstructor, update)));
    }

    if (destroy) {
        router.delete("/:id", rw(createDeleteHandler(modelConstructor, destroy)));
    }
}

