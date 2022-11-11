const express                        = require("express");
const { param, body, cookie, query } = require("express-validator");
const lib                            = require("../lib");
const auth                           = require("../controllers/Auth");
const userController                 = require("../controllers/User");
const User                           = require("../db/models/User");


const router = module.exports = express.Router({ mergeParams: true });

/**
 * Strip some fields from user JSON for security reasons
 * @param {User|object} user
 */
function secure(user) {
    const out = user instanceof User ? user.toJSON() : user
    delete out.password // for security reasons
    delete out.sid // for security reasons
    return out
}


// List all users --------------------------------------------------------------
router.get(
    "/",
    auth.requirePermission("users_list"),
    lib.validateRequest(
        query("where", "The 'where' parameter is forbidden on users").not().exists(),
        query("include", "The 'include' parameter is forbidden on users").not().exists()
    ),
    (req, res, next) => userController.getAllUsers(lib.getFindOptions(req))
        .then(users => res.json(users.map(user => secure(user))))
        .catch(next)
);

// Activate account ------------------------------------------------------------
router.get(
    "/activate/:code?",
    auth.requirePermission("users_check_activation"),
    lib.validateRequest(
        param("code", "Missing code parameter").exists()
    ),
    // @ts-ignore
    (req, res, next) => userController.checkActivation(req.params.code)
        .then(u => res.end(u))
        .catch(next)
);

// Get one user by ID ----------------------------------------------------------
router.get(
    "/:id",
    lib.validateRequest(
        param("id", "The 'id' parameter must be integer").isInt(),
        param("id", "The 'id' parameter must be a positive integer").toInt().custom(x => x > 0)
    ),
    auth.requirePermission("users_view", req => req.user?.id === +req.params.id),
    (req, res, next) => userController.getUser(+req.params?.id)
        .then(user => res.json(secure(user)))
        .catch(next)
);

// Update account (of the current user) ----------------------------------------
router.put(
    "/me",
    express.json(),
    auth.requirePermission("users_update", req => !!req.cookies.sid),
    lib.validateRequest(
        cookie("sid").exists(),
        body("password", "Missing password parameter").exists(),
        body("name", "Missing name parameter").exists(),
        body("newPassword2", "Missing newPassword2 parameter").if(body("newPassword1").exists()).exists()
    ),
    (req, res, next) => userController.updateAccount(req.cookies.sid, req.body)
        .then(user => res.json(secure(user)))
        .catch(next)
);

// Update user -----------------------------------------------------------------
router.put(
    "/:id",
    express.json(),
    auth.requirePermission("users_update", req => req.user?.id === +req.params.id),
    lib.validateRequest(
        param("id", "The 'id' parameter must be integer").isInt(),
        param("id", "The 'id' parameter must be a positive integer").toInt().custom(x => x > 0),
        // body("email").isEmail().normalizeEmail().toLowerCase(),
        // body("role").isIn(["user", "manager", "admin"])
    ),
    (req, res, next) => userController.updateUser(+req.params?.id, req.body)
        .then(user => res.json(secure(user)))
        .catch(next)
);

// Create user -----------------------------------------------------------------
router.post(
    "/",
    express.json(),
    auth.requirePermission("users_create"),
    lib.validateRequest(
        body("email").isEmail().normalizeEmail().toLowerCase(),
        body("role").isIn(["user", "manager", "admin"])
    ),
    (req, res, next) => userController.createUser(req.body)
        .then(user => res.json(secure(user)))
        .catch(next)
);

// Invite new user -------------------------------------------------------------
router.post(
    "/invite",
    express.json(),
    auth.requirePermission("users_invite"),
    lib.validateRequest(
        body("email", "Missing email property").exists(),
        body("role" , "Missing role property").exists(),
        body("email", "Invalid email").isEmail().normalizeEmail({ all_lowercase: true }),
        body("role", "Invalid role").isIn(["user", "manager", "admin"])
    ),
    // @ts-ignore
    (req, res, next) => userController.handleUserInvite(req.body, req.user.email, lib.getRequestBaseURL(req))
        .then(user => res.json(secure(user)))
        .catch(next)
);

// Activate account ------------------------------------------------------------
router.post(
    "/activate",
    express.json(),
    auth.requirePermission("users_activate"),
    lib.validateRequest(
        body("code", "Missing code parameter").exists(),
        body("name", "Missing name parameter").exists(),
        body("newPassword1", "Missing newPassword1 parameter").exists(),
        body("newPassword2", "Missing newPassword2 parameter").exists()
    ),
    (req, res, next) => userController.activateAccount(req.body)
        .then(user => res.json(secure(user)))
        .catch(next)
);

// Delete user -----------------------------------------------------------------
router.delete(
    "/:id",
    lib.validateRequest(
        param("id", "The 'id' parameter must be an integer").isInt(),
        param("id", "The 'id' parameter must be a positive integer").toInt().custom(x => x > 0),
    ),
    auth.requirePermission("users_delete", req => req.user?.id === +req.params.id),
    (req, res, next) => userController.deleteUser(+req.params?.id)
        .then(user => res.json(secure(user)))
        .catch(next)
);