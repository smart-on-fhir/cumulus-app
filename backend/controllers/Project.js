const { HttpError } = require("httperrors");
const Project       = require("../db/models/Project");
const { assert }    = require("../lib");


/**
 * @param {import("sequelize").FindOptions} [options]
 * @see lib.getFindOptions
 */
async function getAll(options = {}) {
    try {
        return await Project.findAll(options);
    } catch (e) {
        throw new HttpError.BadRequest("Error reading projects", { options });
    }
}

/**
 * @param {number} id
 */
async function getOne(id) {
    const user = await Project.findByPk(id);
    assert(user, "Project not found", HttpError.NotFound);
    return user;
}

/**
 * @param {number} id 
 * @param {import("sequelize").InstanceDestroyOptions} [options]
 */
async function destroy(id, options) {
    const user = await Project.findByPk(id);
    assert(user, "Project not found", HttpError.NotFound);
    await user.destroy(options);
    return user;
}

/**
 * @param {Record<string, any>} payload
 * @param {import("sequelize").CreateOptions} [options]
 */
async function create(payload, options) {
    try {
        return await Project.create(payload, options)
    } catch {
        throw new HttpError.BadRequest("Error creating project");
    }
}

/**
 * @param {number} id
 * @param {Record<string, any>} payload
 * @param {import("sequelize").InstanceUpdateOptions} [options]
 */
async function update(id, payload, options) {
    const model = await Project.findByPk(id);
    assert(model, "Project not found", HttpError.NotFound);
    try {
        delete payload.id
        return await model.update(payload, options);
    } catch {
        throw new HttpError.BadRequest("Error updating project");
    }
}


module.exports = {
    getAll,
    getOne,
    create,
    update,
    destroy
};

