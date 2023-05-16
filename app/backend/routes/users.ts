import express        from "express"
import { body }       from "express-validator"
import * as lib       from "../lib"
import User           from "../db/models/User"
import { route }      from "../lib/route"
import { AppRequest } from ".."
import { Unauthorized } from "../errors"
import {
    getAllUsers,
    checkActivation,
    getUser,
    updateAccount,
    updateUser,
    createUser,
    handleUserInvite,
    activateAccount,
    deleteUser
} from "../controllers/User"


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
        const users = await getAllUsers(lib.getFindOptions(req))
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
        const result = await checkActivation(req.params.code)
        res.end(result)
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
        const user = await getUser(+req.params?.id)
        res.json(secure(user))
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
        const user = await updateAccount(req.cookies.sid, req.body)
        res.json(secure(user))
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
        const user = await updateUser(+req.params?.id, req.body)
        res.json(secure(user))
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
        const user = await createUser(req.body)
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
    async handler(req: AppRequest, res) {
        lib.assert(req.user?.email, "Guest cannot invite users", Unauthorized)
        const user = await handleUserInvite(req.body, req.user.email, lib.getRequestBaseURL(req))
        res.json(secure(user))
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
        const user = await activateAccount(req.body)
        res.json(secure(user))
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
        const user = await deleteUser(+req.params?.id)
        res.json(secure(user))
    }
});

export default router
