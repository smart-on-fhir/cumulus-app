import Crypto                from "crypto"
import Bcrypt                from "bcryptjs"
import express, { Router }   from "express"
import { body }              from "express-validator"
import { error as logError } from "../services/logger"
import { InferAttributes }   from "sequelize"
import moment                from "moment"
import * as lib              from "../lib"
import User                  from "../db/models/User"
import { route }             from "../lib/route"
import * as mail             from "../services/email"
import SystemUser            from "../SystemUser"
import config                from "../config"
import {
    BadRequest,
    Conflict,
    Forbidden,
    Gone,
    InternalServerError,
    NotFound,
    Unauthorized
} from "../errors"


export const router: Router = express.Router({ mergeParams: true });

/**
 * Strip some fields from user JSON for security reasons
 */
function secure(user: User|object) {
    const out: Record<string, any> = user instanceof User ? user.toJSON() : user
    delete out.password
    delete out.sid
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

        // Account already activated
        lib.assert(!user.password, "Account already activated", Conflict);

        // User found but created too long ago.
        if (moment().diff(moment(user.createdAt), "hours") > config.userInviteExpireAfterHours) {
            throw new Gone("Expired invitation");
        }

        res.end("Pending activation")
    }
})

// Get info for the current user -----------------------------------------------
route(router, {
    path: "/me",
    method: "get",
    async handler(req, res) {
        const user = req.user!
        res.json(secure({
            ...user,
            permissions: Object.keys(user.permissions).filter(k => !!user.permissions[k])
        }))
    }
});

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
            error.cause = (e as Error).stack
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
        const { name, role } = req.body
        await model.update({ name, role }, { user: req.user });
        res.json(secure(model))
    }
});

// Create user -----------------------------------------------------------------
// route(router, {
//     path: "/",
//     method: "post",
//     request: {
//         schema: {
//             email: {
//                 in: "body",
//                 isEmail: true,
//                 toLowerCase: true
//             },
//             role: {
//                 in: "body",
//                 isIn: {
//                     options: [["user", "manager", "admin"]],
//                 }
//             }
//         }
//     },
//     async handler(req, res) {
//         const user = await User.create(req.body, { user: req.user })
//         res.json(secure(user))
//     }
// });

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

        const { email, role, message, force } = req.body;

        const activationCode = Crypto.randomBytes(32).toString("hex")

        try {
            if (force) {
                await User.update({
                    invitedBy: req.user.email,
                    activationCode,
                    createdAt: new Date()
                }, {
                    where: { email, role },
                    limit: 1,
                    transaction,
                    user: req.user
                })
            } else {
                await User.create({
                    email,
                    role,
                    invitedBy: req.user.email,
                    activationCode
                }, {
                    transaction,
                    user: req.user
                });
            }
        } catch (e) {
            logError({ user: req.user.email, role: req.user.role }, "Error inviting user: " + (e as Error).message)

            await transaction.rollback()

            if ((e as Error).name === "SequelizeUniqueConstraintError") {
                throw new BadRequest("User already invited")
            }

            throw e
        }

        try {
            await mail.inviteUser({
                email,
                code   : activationCode!,
                baseUrl: lib.getRequestBaseURL(req),
                message
            })
        } catch (e) {
            logError({ user: req.user.email, role: req.user.role }, "Error sending invitation email: " + (e as Error).message)
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

        // @ts-ignore User found but created too long ago.
        if (moment().diff(moment(user.createdAt), "hours") > config.userInviteExpireAfterHours) {
            throw new Gone("Expired invitation");
        }

        // password confirmation must match
        lib.assert(newPassword1 === newPassword2, "Passwords do not match", BadRequest);

        try {
            await user.update({ name, password: newPassword1, activationCode: null }, { user: { ...req.user!, role: "owner" }})
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

// Reset Password --------------------------------------------------------------

// User submits the password reset form providing code and passwords 
route(router, {
    path: "/update-password",
    method: "post",
    request: {
        schema: {
            code: {
                in: "body",
                exists: true,
                errorMessage: "Missing code parameter"
            },
            password: {
                in: "body",
                exists: true,
                errorMessage: "Missing password parameter"
            }
        }
    },
    async handler(req, res) {

        await lib.wait(1000) // for security reasons

        const { code, password } = req.body

        // Find the user
        const user = await User.findOne({
            where: { activationCode: code },
            user: SystemUser
        })

        // No such user
        lib.assert(user, "Invalid password reset code", BadRequest);

        // User found but link created too long ago.
        if (moment().diff(moment(user.activateUntil), "hours") > 0) {
            throw new Gone("Expired password reset link");
        }

        try {
            await user.update({
                password,
                activationCode: null,
                activateUntil : null
            }, { user: SystemUser })
            res.end("Password updated")
        } catch (e) {
            const error = new BadRequest("Error updating account")
            error.cause = (e as Error).stack
            throw error
        }
    }
})

// User submits the password reset form providing the email 
route(router, {
    path: "/reset",
    method: "post",
    request: {
        schema: {
            email: {
                in          : "body",
                errorMessage: "Missing email parameter",
                exists      : true
            },
        },
    },
    async handler(req, res) {

        await lib.wait(1000) // for security reasons

        const { email } = req.body

        // Verify that this email exists in our DB
        const user = await User.findOne({ where: { email }, user: SystemUser })

        // No such user
        lib.assert(user, "No user found using this email", BadRequest)

        // Re-generate the activationCode
        const newActivationCode = Crypto.randomBytes(32).toString("hex")

        // Also reset user.createdAt
        await user.update({
            activationCode: newActivationCode,
            activateUntil : moment().add(config.userResetExpireAfterHours, "hours").toDate()
        }, { user: SystemUser })

        // Send email with reset link
        await mail.sendResetPasswordEmail({
            baseUrl: lib.getRequestBaseURL(req),
            code   : newActivationCode,
            email
        })

        res.end("Password reset email sent")
    }
})

export default router
