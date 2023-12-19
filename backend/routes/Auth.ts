import express, { NextFunction, Request, Response } from "express"
import Crypto                                       from "crypto"
import Bcrypt                                       from "bcryptjs"
import { Op }                                       from "sequelize"
import User                                         from "../db/models/User"
import { wait }                                     from "../lib"
import * as logger                                  from "../services/logger"
import { BadRequest }                               from "../errors"
import { app }                                      from "../.."
import { AppRequest }                               from "../types"
import SystemUser                                   from "../SystemUser"



const AUTH_DELAY = process.env.NODE_ENV === "test" ? 0 : 1000;

export const router = express.Router({ mergeParams: true });


/**
 * Authentication middleware ---------------------------------------------------
 * If the user has a "sid" cookie look it up in the users table. If such user
 * is found store it at `req.user` as an object with username, role and sid
 * properties. Otherwise `req.user` will be undefined.
 */
export function authenticate() {
    return async (req: app.UserRequest, res: Response, next: NextFunction) => {
        const { sid } = req.cookies;
        // @ts-ignore
        (req as AppRequest).user = { role: "guest", id: -1, permissions: {} }; 
        if (sid) {
            try {
                // @ts-ignore
                const user = await User.findOne({ where: { sid }, user: SystemUser });
                if (user) {
                    const currentUser = user.toJSON() as any;
                    currentUser.permissions = await user.getPermissions();
                    (req as AppRequest).user = currentUser
                }
            } catch (ex) {
                logger.error(ex);
            }
        }
        else {
            // get permissions for guest?
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
        const user = await User.findOne({ where: { email: { [Op.iLike]: username }}, user: SystemUser });

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

        // Collect what this user will be allowed to do
        const permissions = await user.getPermissions()

        // Generate SID and update the user in DB
        const sid = Crypto.randomBytes(32).toString("hex");
        
        // Update user's lastLogin and sid properties
        await user.update({ sid, lastLogin: new Date() }, { user: SystemUser });

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
            permissions: Object.keys(permissions).filter(k => !!permissions[k])
        });

    } catch (ex) {
        logger.error(ex)
        res.status(401).end("Login failed");
    }
}

async function logout(req: AppRequest, res: Response) {

    await wait(AUTH_DELAY);

    const { user } = req;
    if (user && user.sid) {
        try {
            await User.findOne({ where: { sid: user.sid }, user: SystemUser })
                .then(model => {
                    if (model) {
                        return model.update({ sid: null }, { user: SystemUser });
                    }
                });
        } catch (ex) {
            logger.error(ex);
        }
    }
    res.clearCookie("sid").json({ message: "Logged out" }).end();
}

router.post("/login", express.json(), login);
router.get("/logout", logout);

