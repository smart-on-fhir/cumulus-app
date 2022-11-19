import * as HttpError from "../errors"
import Tag            from "../db/models/Tag"
import { assert }     from "../lib"
import {
    CreateOptions,
    CreationAttributes,
    FindOptions,
    InstanceDestroyOptions,
    InstanceUpdateOptions
} from "sequelize"
import { CurrentUser } from "..";

interface CreateTagOptions extends CreateOptions {
    user?: CurrentUser
}


export async function getAll(options?: FindOptions) {
    try {
        return await Tag.findAll(options);
    } catch (e) {
        throw HttpError.BadRequest("Error reading tags", { options });
    }
}

export async function getOne(id: number) {
    const model = await Tag.findByPk(id);
    assert(model, "Tag not found", HttpError.NotFound);
    return model;
}

export async function destroy(id: number, options: InstanceDestroyOptions) {
    const model = await Tag.findByPk(id);
    assert(model, "Tag not found", HttpError.NotFound);
    await model.destroy(options);
    return model;
}

export async function create(payload: CreationAttributes<Tag>, options: CreateTagOptions) {
    try {
        return await Tag.create(payload, options as CreateOptions)
    } catch {
        throw new HttpError.BadRequest("Error creating tag");
    }
}

export async function update(id: number, payload: Record<string, any>, options: InstanceUpdateOptions) {
    const model = await Tag.findByPk(id);
    assert(model, "Tag not found", HttpError.NotFound);
    try {
        delete payload.id
        return await model.update(payload, options);
    } catch {
        throw new HttpError.BadRequest("Error updating tag");
    }
}
