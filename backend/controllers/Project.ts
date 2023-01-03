import * as HttpError  from "../errors"
import Project         from "../db/models/Project"
import { assert }      from "../lib"
import {
    CreateOptions,
    CreationAttributes,
    FindOptions,
    InstanceDestroyOptions,
    InstanceUpdateOptions
} from "sequelize"


export async function getAll(options: FindOptions = {}) {
    try {
        return await Project.findAll(options);
    } catch (e) {
        throw new HttpError.BadRequest("Error reading projects", { options, cause: e });
    }
}

export async function getOne(id: number) {
    const user = await Project.findByPk(id);
    assert(user, "Project not found", HttpError.NotFound);
    return user;
}

export async function destroy(id: number, options: InstanceDestroyOptions) {
    const user = await Project.findByPk(id);
    assert(user, "Project not found", HttpError.NotFound);
    await user.destroy(options);
    return user;
}

export async function create(payload: CreationAttributes<Project>, options: CreateOptions) {
    try {
        return await Project.create(payload, options)
    } catch {
        throw new HttpError.BadRequest("Error creating project");
    }
}

export async function update(id: number, payload: Record<string, any>, options: InstanceUpdateOptions) {
    const model = await Project.findByPk(id);
    assert(model, "Project not found", HttpError.NotFound);
    try {
        delete payload.id
        return await model.update(payload, options);
    } catch {
        throw new HttpError.BadRequest("Error updating project");
    }
}
