import Crypto              from "crypto"
import Bcrypt              from "bcryptjs"
import express             from "express"
import { body }            from "express-validator"
import { debuglog }        from "util"
import { InferAttributes } from "sequelize"
import moment              from "moment"
import * as lib            from "../lib"
import User                from "../db/models/User"
import { route }           from "../lib/route"
import * as mail           from "../mail"
import SystemUser          from "../SystemUser"
import {
    BadRequest,
    Conflict,
    Forbidden,
    Gone,
    InternalServerError,
    NotFound,
    Unauthorized
} from "../errors"

const debug = debuglog("app");

const router = express.Router({ mergeParams: true });

/**
 * Strip some fields from user JSON for security reasons
 */
function secure(user: User|object) {
    const out: Record<string, any> = user instanceof User ? user.toJSON() : user
    delete out.password // remove for security reasons
    delete out.sid      // remove for security reasons
    return out
}


// List all users --------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    request: {
        schema: {
            where: {
                in: "query",
                exists: {
                    negated: true,
                    errorMessage: "The 'where' parameter is forbidden on users"
                }
            },
            include: {
                in: "query",
                exists: {
                    negated: true,
                    errorMessage: "The 'include' parameter is forbidden on users"
                }
            }
        }
    },
    async handler(req, res) {
        const users = await User.findAll({ ...lib.getFindOptions(req), user: req.user })
        res.json(users.map(user => secure(user)))
    }
})

// Activate account ------------------------------------------------------------
route(router, {
    path: "/activate/:code?",
    method: "get",
    request: {
        schema: {
            code: {
                in: "params",
                exists: true,
                errorMessage: "Missing code parameter"
            }
        }
    },
    async handler(req, res) {

        const user = await User.findOne({
            where: { activationCode: req.params.code },
            user: SystemUser
        })

        // No such user. Perhaps the invitation expired and the temp. user was deleted
        lib.assert(user, "Invalid or expired invitation", NotFound);

        // @ts-ignore Account already activated
        lib.assert(!user.password, "Account already activated", Conflict);

        // @ts-ignore User found but created more than a day ago.
        if (moment().diff(moment(user.createdAt), "days") > 1) {
            throw new Gone("Expired invitation");
        }

        res.end("Pending activation")
    }
})

// Get one user by ID ----------------------------------------------------------
route(router, {
    path: "/:id",
    method: "get",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            }
        }
    },
    async handler(req, res) {
        const model = await User.findByPk(+req.params?.id, { user: req.user });
        lib.assert(model, "User not found", NotFound);
        res.json(secure(model))
    }
});

// Update account (of the current user) ----------------------------------------
route(router, {
    path: "/me",
    method: "put",
    request: {
        schema: {
            sid: {
                in: "cookies",
                exists: true
            },
            password: {
                in: "body",
                exists: true,
                errorMessage: "Missing password parameter"
            },
            name: {
                in: "body",
                exists: true,
                errorMessage: "Missing name parameter"
            },
            newPassword2: {
                in: "body",
                exists: {
                    if: body("newPassword1").exists()
                },
                errorMessage: "Missing newPassword2 parameter"
            }
        }
    },
    async handler(req, res) {

        // Find the logged-in user
        const model = await User.findOne({ where: { sid: req.cookies.sid }, user: req.user})
        lib.assert(model, "User not found", NotFound);

        // Filter out the payload fields we need
        const { password, newPassword1, newPassword2, name } = req.body;

        // Check password
        if (!Bcrypt.compareSync(password, model.password || "")) {
            throw new Forbidden("Invalid password");
        }

        // Initialize the patch object
        const patch: Partial<InferAttributes<User>> = { name };

        // Update password if needed
        if (newPassword1) {
            if (newPassword1 !== newPassword2) {
                throw new BadRequest("New passwords do not match");
            }
            patch.password = newPassword1
        }

        try {
            await model.update(patch, { user: req.user });
            res.json({
                email: model.email,
                name : model.name,
                role : model.role
            });
        } catch (e) {
            const error = new BadRequest("Error updating account")
            error.cause = e.stack
            throw error
        }
    }
})

// Update user -----------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            }
        }
    },
    async handler(req, res) {
        const model = await User.findByPk(+req.params?.id, { user: req.user });
        lib.assert(model, "User not found", NotFound);
        const payload = { ...req.body }
        delete payload.id;
        delete payload.email;
        await model.update(payload, { user: req.user });
        res.json(secure(model))
    }
});

// Create user -----------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
    request: {
        schema: {
            email: {
                in: "body",
                isEmail: true,
                toLowerCase: true
            },
            role: {
                in: "body",
                isIn: {
                    options: [["user", "manager", "admin"]],
                }
            }
        }
    },
    async handler(req, res) {
        const user = await User.create(req.body, { user: req.user })
        res.json(secure(user))
    }
});

// Invite new user -------------------------------------------------------------
route(router, {
    path  : "/invite",
    method: "post",
    request: {
        schema: {
            email: {
                in: "body",
                exists: {
                    errorMessage: "Missing email property",
                },
                isEmail: {
                    errorMessage: "Invalid email"
                },
                toLowerCase: true
            },
            role: {
                in: "body",
                exists: {
                    errorMessage: "Missing role property"
                },
                isIn: {
                    options: [["user", "manager", "admin"]],
                    errorMessage: "Invalid role"
                }
            }
        }
    },
    async handler(req, res) {
        lib.assert(req.user?.email, "Guest cannot invite users", Unauthorized)

        // @ts-ignore 
        const transaction = await User.sequelize.transaction();

        const { email, role, message } = req.body;

        try {
            var user = await User.create({
                email,
                role,
                invitedBy: req.user.email,
                activationCode: Crypto.randomBytes(32).toString("hex")
            }, {
                transaction,
                user: req.user
            });
        } catch (e) {
            debug(e)

            await transaction.rollback()

            if (e.name === "SequelizeUniqueConstraintError") {
                throw new BadRequest("User already invited")
            }

            throw e
        }

        try {
            await mail.inviteUser({
                email  : user.email,
                code   : user.activationCode!,
                baseUrl: lib.getRequestBaseURL(req),
                message
            })
        } catch (e) {
            debug(e)
            await transaction.rollback()
            throw new InternalServerError("Error sending invitation email")
        }

        await transaction.commit()

        res.json({ message: "User invited" })
    }
});

// Activate account ------------------------------------------------------------
route(router, {
    path: "/activate",
    method: "post",
    request: {
        schema: {
            code: {
                in: "body",
                errorMessage: "Missing code parameter",
                exists: true
            },
            name: {
                in: "body",
                errorMessage: "Missing name parameter",
                exists: true
            },
            newPassword1: {
                in: "body",
                errorMessage: "Missing newPassword1 parameter",
                exists: true
            },
            newPassword2: {
                in: "body",
                errorMessage: "Missing newPassword2 parameter",
                exists: true
            }
        }
    },
    async handler(req, res) {
        
        const { code, name, newPassword1, newPassword2 } = req.body

        const user = await User.findOne({ where: { activationCode: code }, user: SystemUser })

        // No such user. Perhaps the invitation expired and the temp. user was deleted
        lib.assert(user, "Invalid or expired invitation", NotFound);

        // @ts-ignore Account already activated
        lib.assert(!user.password, "Account already activated", Conflict);

        // @ts-ignore User found but created more than a day ago.
        if (moment().diff(moment(user.createdAt), "days") > 1) {
            throw new Gone("Expired invitation");
        }

        // password confirmation must match
        lib.assert(newPassword1 === newPassword2, "Passwords do not match", BadRequest);

        try {
            await user.update({ name, password: newPassword1 }, { user: { ...req.user!, role: "owner" }})
            res.json({ name: user.name })
        } catch (cause) {
            throw new BadRequest("Error activating account", { cause })
        }
    }
});

// Delete user -----------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "delete",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            }
        }
    },
    async handler(req, res) {
        const model = await User.findByPk(+req.params?.id, { user: req.user });
        lib.assert(model, "User not found", NotFound);
        await model.destroy({ user: req.user });
        res.json(secure(model))
    }
});

export default router
