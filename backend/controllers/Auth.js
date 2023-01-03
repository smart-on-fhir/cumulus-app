const express        = require("express")
const Crypto         = require("crypto")
const Bcrypt         = require("bcryptjs")
const { Op }         = require("sequelize")
const User           = require("../db/models/User").default
const { wait }       = require("../lib")
const { logger }     = require("../logger")
const HttpError      = require("../errors")
const { getPermissionsForRole } = require("../acl")



const AUTH_DELAY = process.env.NODE_ENV === "production" ? 1000 : 1000;

const router = express.Router({ mergeParams: true });


/**
 * Authentication middleware ---------------------------------------------------
 * If the user has a "sid" cookie look it up in the users table. If such user
 * is found store it at `req.user` as an object with username, role and sid
 * properties. Otherwise `req.user` will be undefined.
 * @param {import("../..").app.UserRequest} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function authenticate(req, res, next) {
    const dbConnection = req.app.get("dbConnection")
    const { sid } = req.cookies;
    if (sid) {
        try {
            const user = await User.findOne({ where: { sid }, __role__: "system" });
            if (user) {
                req.user = user.toJSON()   
                dbConnection.user = user; 
            }
        } catch (ex) {
            dbConnection.user = { role: "guest" }; 
            logger.error(ex, { tags: ["AUTH"] });
        }
    } else {
        dbConnection.user = { role: "guest" }; 
    }
    // console.log(dbConnection.user?.email)
    next();
}

/**
 * Require Authentication middleware -------------------------------------------
 * Checks `req.user?.role`.
 * - if the user does not exist throws HttpError.Unauthorized
 * - if the user does not have one of the required roles throws HttpError.Forbidden
 * @param {import("..").Role[]} roles The roles to require
 * @returns {(
 *  req: import("../..").app.UserRequest,
 *  res: import("express").Response,
 *  next: import("express").NextFunction
 * ) => void}
 */
function requireAuth(...roles) {
    return function(req, res, next) {
        
        if (!req.user) {
            return next(new HttpError.Unauthorized("Authorization required"));
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return next(new HttpError.Forbidden("Permission denied"));
        }

        next();
    }
}

/**
 * WARNING: This is just a temporary solution for demo. Not secure enough for
 * real use!
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
async function login(req, res) {
    
    // Introduce 1 second artificial delay to protect against automated
    // brute-force attacks
    await wait(AUTH_DELAY);

    try {

        const { username, password, remember } = req.body;

        // Search for user by username
        const user = await User.findOne({ where: { email: { [Op.iLike]: username }}, __role__: "system" });

        // No such username
        // Do NOT specify what is wrong in the error message!
        if (!user) {
            logger.warn("Failed login attempt due to invalid email")
            throw new HttpError.BadRequest("Invalid email or password", { reason: `Email ${username} not found` });
        }

        // Wrong password (Do NOT specify what is wrong in the error message!)
        if (!Bcrypt.compareSync(password, user.get("password") + "")) {
            logger.warn("Failed login attempt due to invalid password")
            throw new HttpError.BadRequest("Invalid email or password", { reason: "Invalid password" });
        }

        // Generate SID and update the user in DB
        const sid = Crypto.randomBytes(32).toString("hex");
        
        // Update user's lastLogin and sid properties
        await user.update({ sid, lastLogin: new Date() }, { __role__: "system" });

        // Use session cookies by default
        let expires = undefined

        // If "remember" is set use cookies that expire in one year
        if (remember) {
            expires = new Date()
            expires.setFullYear(new Date().getFullYear() + 1)
        }

        res.cookie("sid", sid, { httpOnly: true, expires });

        res.json({
            id   : user.get("id"),
            name : user.get("name"),
            email: user.get("email"),
            role : user.get("role"),
            remember,
            permissions: getPermissionsForRole(user.get("role"))
        });

    } catch (ex) {
        logger.error(ex, { tags: ["AUTH"] })
        res.status(401).end("Login failed");
    }
}

/**
 * WARNING: This is just a temporary solution for demo. Not secure enough for
 * real use!
 * @param {any} req 
 * @param {express.Response} res 
 */
async function logout(req, res) {

    await wait(AUTH_DELAY);

    const { user } = req;
    if (user && user.sid) {
        try {
            await User.findOne({ where: { sid: user.sid }})
                .then(model => {
                    if (model) {
                        return model.update({ sid: null }, { __role__: "system" });
                    }
                });
        } catch (ex) {
            logger.error(ex, { tags: ["AUTH"] });
        }
    }
    res.clearCookie("sid").json({ message: "Logged out" }).end();
}

router.post("/login", express.json(), login);
router.get("/logout", logout);

module.exports = {
    router,
    authenticate,
    requireAuth
};
