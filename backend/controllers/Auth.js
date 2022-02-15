const express   = require("express")
const Crypto    = require("crypto")
const HttpError = require("httperrors")
const User      = require("../db/models/User")


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
    const { sid } = req.cookies;
    if (sid) {
        try {
            const user = await User.findOne({ where: { sid }});
            if (user) {
                req.user = user.toJSON()    
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    next();
}

/**
 * Require Authentication middleware -------------------------------------------
 * Checks `req.user` and if that does not exist or does not have the same role
 * redirects to the login page.
 * role The role to require. Currently only "admin" is supported
 * @param {string[]} roles
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

        if (!roles.includes(req.user.role)) {
            return next(new HttpError.Forbidden("Permission denied"))//.json({ error: "Permission denied" });
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
    try {

        const { username, password, remember } = req.body;

        // Search for user by username
        const user = await User.findOne({ where: { username }});

        // No such username
        // Do NOT specify what is wrong in the error message!
        if (!user) {
            throw new Error("Invalid username or password");
        }

        // Wrong password
        // Do NOT specify what is wrong in the error message!
        if (password !== user.get("password")) {
            throw new Error("Invalid username or password");
        }

        // Generate SID and update the user in DB
        const sid = Crypto.randomBytes(32).toString("hex");
        
        // Update user's lastLogin and sid properties
        await user.update({ sid, lastLogin: new Date() });

        // Use session cookies by default
        let expires = undefined

        // If "remember" is set use cookies that expire in one year
        if (remember) {
            expires = new Date()
            expires.setFullYear(new Date().getFullYear() + 1)
        }

        res.cookie("sid", sid, {
            httpOnly: true,
            expires,
            // domain: "http://localhost:4000",
            // sameSite: "lax"
        }).json({ username, role: user.get("role"), remember }).end();

    } catch (ex) {
        res.status(401).end(ex.code === 'SQLITE_ERROR' ? "Login failed" : ex.message);
    }
}

/**
 * WARNING: This is just a temporary solution for demo. Not secure enough for
 * real use!
 * @param {any} req 
 * @param {express.Response} res 
 */
async function logout(req, res) {
    const { user } = req;
    if (user && user.sid) {
        try {
            await User.findOne({ where: { sid: user.sid }})
                .then(model => {
                    if (model) {
                        return model.update({ sid: null });
                    }
                });
        } catch (ex) {
            console.error(ex);
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
