const Crypto        = require("crypto");
const Bcrypt        = require("bcryptjs");
const HttpError     = require("../errors");
const moment        = require("moment");
const { debuglog }  = require("util");
const User          = require("../db/models/User");
const mail          = require("../mail");
const { assert }    = require("../lib");
const { roles }     = require("../acl");

const debug = debuglog("app");


/**
 * Get all users
 * @param {import("sequelize").FindOptions} [options]
 * @see lib.getFindOptions
 */
async function getAllUsers(options = {}) {
    try {
        return await User.findAll(options);
    } catch {
        throw new HttpError.BadRequest("Error reading users");
    }
}

/**
 * Get user by id
 * @param {number} id
 */
async function getUser(id) {
    const user = await User.findByPk(id);
    assert(user, "User not found", HttpError.NotFound);
    return user;
}

/**
 * Delete user by ID
 * @param {number} id 
 */
async function deleteUser(id) {
    const user = await User.findByPk(id);
    assert(user, "User not found", HttpError.NotFound);
    await user.destroy();
    return user;
}

/**
 * Creates new user
 * @param {Record<string, any>} payload
 */
async function createUser(payload) {
    try {
        return await User.create(payload)
    } catch {
        throw new HttpError.BadRequest("Error creating user");
    }
}

/**
 * Updates the user with the given ID
 * @param {number} id User ID
 * @param {Record<string, any>} payload
 */
async function updateUser(id, payload) {
    const model = await User.findByPk(id);
    assert(model, "User not found", HttpError.NotFound);
    try {
        delete payload.id
        delete payload.email
        return await model.update(payload);
    } catch {
        throw new HttpError.BadRequest("Error updating user");
    }
}

/**
 * Updates user account
 * @param {string} sid Session ID
 * @param {Record<string, any>} payload 
 */
async function updateAccount(sid, payload) {

    // Find the logged-in user
    const model = await User.findOne({ where: { sid }})
    assert(model, "User not found", HttpError.NotFound);

    // Filter out the payload fields we need
    const { password, newPassword1, newPassword2, name } = payload;

    // Check password
    if (!Bcrypt.compareSync(password, model.get("password") + "")) {
        throw new HttpError.Forbidden("Invalid password");
    }

    // Initialize the patch object
    const patch = { name };

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
            email: model.getDataValue("email"),
            name : model.getDataValue("name"),
            role : model.getDataValue("role")
        };
    } catch (e) {
        throw new HttpError.BadRequest("Error updating account")
    }
}

/**
 * Activates a pending account
 * @param {object} options 
 * @param {string} options.code
 * @param {string} options.name
 * @param {string} options.newPassword1
 * @param {string} options.newPassword2
 */
async function activateAccount({ code, name, newPassword1, newPassword2 }) {

    const user = await User.findOne({ where: { activationCode: code }})

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
        await user.update({ name, password: newPassword1 })
        // @ts-ignore 
        return { name: user.name }
    } catch {
        throw new HttpError.BadRequest("Error activating account")
    }
}

/**
 * Check activation code
 * @param {string} activationCode 
 */
async function checkActivation(activationCode) {
    
    const user = await User.findOne({ where: { activationCode }})

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

/**
 * Invite new user
 * @param {object} options 
 * @param {string} options.email      New user's email 
 * @param {keyof roles} options.role  New user's role 
 * @param {string} [options.message]  Personal message to include in the invitation email
 * @param {string} invitedBy The email of the user who invites this one 
 * @param {string} baseUrl Used to build the activation link in the email
 * @returns 
 */
async function handleUserInvite({ email, role, message }, invitedBy, baseUrl) {
    
    // @ts-ignore 
    const transaction = await User.sequelize.transaction()

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

        throw new HttpError.InternalServerError("Error crating new user")
    }

    try {
        await mail.inviteUser({
            email  : user.getDataValue("email"),
            code   : user.getDataValue("activationCode"),
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


module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    updateAccount,
    deleteUser,
    activateAccount,
    checkActivation,
    handleUserInvite
};

