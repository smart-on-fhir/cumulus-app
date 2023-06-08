import express, { NextFunction, Request, Response } from "express"
import Crypto                                       from "crypto"
import Bcrypt                                       from "bcryptjs"
import { Op }                                       from "sequelize"
import User                                         from "../db/models/User"
import { wait }                                     from "../lib"
import { logger }                                   from "../logger"
import { BadRequest, Forbidden, Unauthorized }      from "../errors"
import { getPermissionsForRole }                    from "../acl"
import { app }                                      from "../.."
import { AppRequest, Role }                         from "../types"



const AUTH_DELAY = process.env.NODE_ENV === "production" ? 1000 : 1000;

export const router = express.Router({ mergeParams: true });


/**
 * Authentication middleware ---------------------------------------------------
 * If the user has a "sid" cookie look it up in the users table. If such user
 * is found store it at `req.user` as an object with username, role and sid
 * properties. Otherwise `req.user` will be undefined.
 */
export async function authenticate(req: app.UserRequest, res: Response, next: NextFunction) {
    const dbConnection = req.app.get("dbConnection")
    const { sid } = req.cookies;
    if (sid) {
        try {
            const user = await User.findOne({ where: { sid }, __role__: "system" });
            if (user) {
                (req as AppRequest).user = user.toJSON()   
                dbConnection.user = user; 
            }
        } catch (ex) {
            dbConnection.user = { role: "guest" }; 
            logger.error(ex, { tags: ["AUTH"] });
        }
    } else {
        dbConnection.user = { role: "guest" }; 
    }
    next();
}

/**
 * Require Authentication middleware -------------------------------------------
 * Checks `req.user?.role`.
 * - if the user does not exist throws HttpError.Unauthorized
 * - if the user does not have one of the required roles throws HttpError.Forbidden
 */
export function requireAuth(...roles: Role[]): (req: app.UserRequest, res: Response, next: NextFunction) => void {
    return function(req, res, next) {
        
        if (!req.user) {
            return next(new Unauthorized("Authorization required"));
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return next(new Forbidden("Permission denied"));
        }

        next();
    }
}

async function login(req: Request, res: Response) {
    
    // Introduce 1 second artificial delay to protect against automated brute-force attacks
    await wait(AUTH_DELAY);

    try {

        const { username, password, remember } = req.body;

        // Search for user by username
        const user = await User.findOne({ where: { email: { [Op.iLike]: username }}, __role__: "system" });

        // No such username
        // Do NOT specify what is wrong in the error message!
        if (!user) {
            logger.warn("Failed login attempt due to invalid email")
            throw new BadRequest("Invalid email or password", { reason: `Email ${username} not found` });
        }

        // Wrong password (Do NOT specify what is wrong in the error message!)
        if (!Bcrypt.compareSync(password, user.get("password") + "")) {
            logger.warn("Failed login attempt due to invalid password")
            throw new BadRequest("Invalid email or password", { reason: "Invalid password" });
        }

        // Generate SID and update the user in DB
        const sid = Crypto.randomBytes(32).toString("hex");
        
        // Update user's lastLogin and sid properties
        await user.update({ sid, lastLogin: new Date() }, { __role__: "system" });

        // Use session cookies by default
        let expires: Date | undefined = undefined

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

async function logout(req: AppRequest, res: Response) {

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

