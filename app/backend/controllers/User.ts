import Crypto         from "crypto"
import Bcrypt         from "bcryptjs"
import * as HttpError from "../errors"
import moment         from "moment"
import { debuglog }   from "util"
import User           from "../db/models/User"
import * as mail      from "../mail"
import { assert }     from "../lib"
import { CreationAttributes, FindOptions, InferAttributes } from "sequelize"


const debug = debuglog("app");

export async function getAllUsers(options: FindOptions = {}) {
    return await User.findAll(options);
}

export async function getUser(id: number) {
    const model = await User.findByPk(id);
    assert(model, "User not found", HttpError.NotFound);
    return model;
}

export async function deleteUser(id: number) {
    const model = await User.findByPk(id);
    assert(model, "User not found", HttpError.NotFound);
    await model.destroy();
    return model;
}

export async function createUser(payload: CreationAttributes<User>) {
    return await User.create(payload)
}

export async function updateUser(id: number, payload: Record<string, any>) {
    const model = await User.findByPk(id);
    assert(model, "User not found", HttpError.NotFound);
    delete payload.id;
    delete payload.email;
    return await model.update(payload);
}

export async function updateAccount(sid: string, payload: {
    password: string
    newPassword1: string
    newPassword2: string
    name: string
}) {

    // Find the logged-in user
    const model = await User.findOne({ where: { sid }})
    assert(model, "User not found", HttpError.NotFound);

    // Filter out the payload fields we need
    const { password, newPassword1, newPassword2, name } = payload;

    // Check password
    if (!Bcrypt.compareSync(password, model.password || "")) {
        throw new HttpError.Forbidden("Invalid password");
    }

    // Initialize the patch object
    const patch: Partial<InferAttributes<User>> = { name };

    // Update password if needed
    if (newPassword1) {
        if (newPassword1 !== newPassword2) {
            throw new HttpError.BadRequest("New passwords do not match");
        }
        patch.password = newPassword1
    }

    try {
        await model.update(patch);
        return {
            email: model.email,
            name : model.name,
            role : model.role
        };
    } catch (e) {
        const error = new HttpError.BadRequest("Error updating account")
        error.cause = e.stack
        throw error
    }
}

export async function activateAccount({
    code,
    name,
    newPassword1,
    newPassword2
}: {
    code        : string
    name        : string
    newPassword1: string
    newPassword2: string
}) {

    const user = await User.findOne({ where: { activationCode: code }, __role__: "system" })

    // No such user. Perhaps the invitation expired and the temp. user was deleted
    assert(user, "Invalid or expired invitation", HttpError.NotFound);

    // @ts-ignore Account already activated
    assert(!user.password, "Account already activated", HttpError.Conflict);

    // @ts-ignore User found but created more than a day ago.
    if (moment().diff(moment(user.createdAt), "days") > 1) {
        throw new HttpError.Gone("Expired invitation");
    }

    // password confirmation must match
    assert(newPassword1 === newPassword2, "Passwords do not match", HttpError.BadRequest);

    try {
        await user.update({ name, password: newPassword1 }, { __role__: "owner" })
        // @ts-ignore 
        return { name: user.name }
    } catch (cause) {
        throw new HttpError.BadRequest("Error activating account", { cause })
    }
}

export async function checkActivation(activationCode: string) {
    
    const user = await User.findOne({ where: { activationCode }, __role__: "system" })

    // No such user. Perhaps the invitation expired and the temp. user was deleted
    assert(user, "Invalid or expired invitation", HttpError.NotFound);

    // @ts-ignore Account already activated
    assert(!user.password, "Account already activated", HttpError.Conflict);

    // @ts-ignore User found but created more than a day ago.
    if (moment().diff(moment(user.createdAt), "days") > 1) {
        throw new HttpError.Gone("Expired invitation");
    }

    return "Pending activation"
}

export async function handleUserInvite(
    options: {
        /**
         * New user's email
         */
        email: string

        /**
         * New user's role
         */
        role: "user" | "manager" | "admin"

        /**
         * Personal message to include in the invitation email
         */
        message?: string
    },

    /**
     * The email of the user who invites this one
     */
    invitedBy: string,

    /**
     * Used to build the activation link in the email
     */
    baseUrl: string
) {
    
    // @ts-ignore 
    const transaction = await User.sequelize.transaction();

    const { email, role, message } = options;

    try {
        var user = await User.create({
            email,
            role,
            invitedBy,
            activationCode: Crypto.randomBytes(32).toString("hex")
        }, {
            transaction
        });
    } catch (e) {
        debug(e)

        await transaction.rollback()

        if (e.name === "SequelizeUniqueConstraintError") {
            throw new HttpError.BadRequest("User already invited")
        }

        throw e
    }

    try {
        await mail.inviteUser({
            email  : user.email,
            code   : user.activationCode!,
            baseUrl,
            message
        })
    } catch (e) {
        debug(e)
        await transaction.rollback()
        throw new HttpError.InternalServerError("Error sending invitation email")
    }

    await transaction.commit()
    return { message: "User invited" }
}
