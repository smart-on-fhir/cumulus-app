import { Router }                from "express"
import { Op, QueryTypes }        from "sequelize"
import Permission                from "../db/models/Permission"
import Graph                     from "../db/models/View"
import User                      from "../db/models/User"
import UserGroup                 from "../db/models/UserGroup"
import DataRequest               from "../db/models/DataRequest"
import RequestGroup              from "../db/models/RequestGroup"
import DataSite                  from "../db/models/DataSite"
import Project                   from "../db/models/Project"
import Tag                       from "../db/models/Tag"
import * as lib                  from "../lib"
import { assert }                from "../lib"
import { route }                 from "../lib/route"
import SystemUser                from "../SystemUser"
import { notifyForGraphsAccess } from "../services/mail"
import {
    BadRequest,
    Forbidden,
    NotFound,
    Unauthorized
} from "../errors"


type Action = "search" | "read" | "create" | "update" | "delete" | "share"
type Role   = "manager" | "user" | "guest"

// Currently only Graphs can be shared but that might change in the future
const SHAREABLE_MODELS: Record<string, { Model: any, actions: Action[] }> = {
    Graphs : {
        Model: Graph as any,
        actions: ["read", "update", "delete", "share"]
    },
    Subscriptions: {
        Model: DataRequest as any,
        actions: ["read", "update", "delete", "share"]
    },
    SubscriptionGroups: {
        Model: RequestGroup as any,
        actions: ["read", "update", "delete", "share"]
    },
    DataSites: {
        Model: DataSite as any,
        actions: ["read", "update", "delete", "share"]
    },
    StudyAreas: {
        Model: Project as any,
        actions: ["read", "update", "delete", "share"]
    },
    Tags: {
        Model: Tag as any,
        actions: ["read", "update", "delete", "share"]
    },
    UserGroups: {
        Model: UserGroup as any,
        actions: ["read", "update", "delete", "share"]
    }
};

const SHAREABLE_ROLES: Role[] = ["manager", "user", "guest" ];

interface InputParams {
    resource     : keyof typeof SHAREABLE_MODELS
    resource_id  : number[] | null
    user_id      : number[] | null
    role         : Role     | null
    user_group_id: number[] | null
    action       : Action[]
    permission   : boolean
}

const router = Router({ mergeParams: true });

function makeArray(x: any) {
    if (Array.isArray(x)) {
        return x
    }
    return [x]
}

export async function emailsToUserIDs(emails: string[]) {
    const list = await User.findAll({
        attributes: ["id"],
        where: {
            email: {
                [Op.in]: emails
            }
        },
        user: SystemUser
    })

    return list.map(row => row.id)
}

/**
 * Validates body parameters and converts them to their expected shape
 * @param body.resource - The resource type. Must be keyof SHAREABLE_MODELS
 * @param [body.resource_id = null] - If set, it means we are managing only the resource(s)
 * with the specified ID(s). Can a number or an array of numbers or null. Defaults
 * to null, which means all resources.
 * @param [body.user_group_id = null] - The ID(s) of the userGroup(s) we are
 * going to share with. Can a number or an array of numbers or null. If set, then 
 * email and role must be null or omitted! 
 * @param [body.role = null] - The role(s) we are going to share with. Can be an
 * array of strings or null. If set, then email and user_group_id must be null
 * or omitted! 
 * @param [body.email = null] - The email(s) of the user(s) we are going to share
 * with. Can a string or an array of strings or null. If set, then user_group_id
 * and role must be null or omitted! 
 * @param body.action - what action are we managing
 * @param body.permission - true to grant permission or false to revoke it
 */
export async function validate(body: Record<string, any>): Promise<InputParams>
{
    let user_id: number[] | null = null
    let {
        resource,
        resource_id = null,
        email,
        role,
        user_group_id,
        action,
        permission
    } = body;

    // resource
    // -------------------------------------------------------------------------
    if (!resource) {
        throw new BadRequest("A 'resource' parameter is required")
    }

    if (typeof resource !== "string") {
        throw new BadRequest("The 'resource' parameter must be a string")
    }

    if (!Object.keys(SHAREABLE_MODELS).includes(resource)) {
        throw new BadRequest(
            `The 'resource' parameter (${JSON.stringify(resource)}) does not ` +
            `point to any resource that can be shared`
        )
    }

    // resource_id
    // -------------------------------------------------------------------------
    if (resource_id) {
        resource_id = makeArray(resource_id ?? [])

        for (const id of resource_id) {
            if (typeof id !== "number" || id < 1 || isNaN(id) || !isFinite(id)) {
                throw new BadRequest("Invalid 'resource_id' parameter")
            }
        }

        const Model = SHAREABLE_MODELS[resource as keyof typeof SHAREABLE_MODELS].Model;
        const count = await Model.count({
            where: {
                id: {
                    [Op.in]: resource_id
                }
            },
            user: SystemUser
        })
        if (count !== resource_id.length) {
            throw new BadRequest("Some 'resource_id' parameters are not found in DB")
        }
    }

    // user_group_id & role & email
    // -------------------------------------------------------------------------
    if (!email && !role && !user_group_id) {
        throw new BadRequest("Please specify who should we share this with")
    }

    if ([email, role, user_group_id].filter(Boolean).length > 1) {
        throw new BadRequest("Only one of email, role or user_group_id can be used")
    }

    // role
    // -------------------------------------------------------------------------
    if (role) {
        role = makeArray(role ?? [])
        const invalid = role.filter((r: Role) => !SHAREABLE_ROLES.includes(r))
        if (invalid.length) {
            throw new BadRequest(`Invalid role(s) ${invalid.join(", ")}`)
        }
    }

    // user_group_id
    // -------------------------------------------------------------------------
    if (user_group_id) {
        user_group_id = makeArray(user_group_id ?? [])

        const count = await UserGroup.count({
            where: {
                id: {
                    [Op.in]: user_group_id
                }
            },
            // user: SystemUser
        })

        if (count !== user_group_id.length) {
            throw new BadRequest("Some 'user_group_id' parameters are not found in DB")
        }
    }

    // email
    // -------------------------------------------------------------------------
    if (email) {
        email = makeArray(email ?? [])

        user_id = await emailsToUserIDs(email)

        if (user_id.length !== email.length) {
            throw new BadRequest("Some 'email' parameters were not found in DB")
        }
    }

    // action
    // -------------------------------------------------------------------------
    if (!action) {
        throw new BadRequest("Please specify what action(s) should be allowed or disallowed")
    }

    action = makeArray(action ?? [])

    for (const a of action) {
        if (!SHAREABLE_MODELS[resource].actions.includes(a)) {
            throw new BadRequest(`Action ${JSON.stringify(a)} is not supported`)
        }
    }

    // allow or disallow
    // -------------------------------------------------------------------------
    if (permission !== true && permission !== false) {
        throw new BadRequest(
            "Please specify if you want to grant or revoke permission by " +
            "setting the 'permission' parameter to true or false"
        )
    }

    return {
        resource: resource as keyof typeof SHAREABLE_MODELS,
        resource_id,
        user_id,
        role,
        user_group_id,
        action,
        permission
    }
}

// Get actions -----------------------------------------------------------------
route(router, {
    path: "/actions",
    method: "get",
    async handler(req, res) {
        const resourceType: keyof typeof SHAREABLE_MODELS = String(req.query.resource)
        if (!resourceType || !(resourceType in SHAREABLE_MODELS)) {
            throw new BadRequest(`Invalid or missing "resource" parameter`)
        }
        
        let { actions } = SHAREABLE_MODELS[resourceType];

        let isOwner = false

        let resource_id = +(req.query.resource_id || 0)
        if (!isNaN(resource_id) && isFinite(resource_id)) {
            isOwner = new SHAREABLE_MODELS[resourceType].Model({ id: resource_id }).isOwnedBy(req.user);
        }

        if (!isOwner && req.user?.role !== "admin") {
            actions = actions.filter(a => !!req.user?.permissions[resourceType + "." + a])
        }
        
        res.json(actions)
    }
})

route(router, {
    path: "/list",
    method: "get",
    request: {
        schema: {
            resource_id: {
                in: ['query'],
                isInt: {
                    errorMessage: "The 'resource_id' parameter must be a positive integer",
                    options: { gt: 0 }
                },
                toInt: true,
            },
            resource: {
                in: ['query']
            }
        }
    },
    async handler(req, res) {
        const resourceType: keyof typeof SHAREABLE_MODELS = String(req.query.resource)
        if (!resourceType || !(resourceType in SHAREABLE_MODELS)) {
            throw new BadRequest(`Invalid or missing "resource" parameter`)
        }

        const { Model } = SHAREABLE_MODELS[resourceType]
        const model = await Model.findByPk(+req.query.resource_id!, { user: SystemUser })

        if (!model) {
            throw new Forbidden("Model not found");
        }

        const isOwner = model.isOwnedBy(req.user)

        if (req.user?.role !== "admin" && !isOwner) {
            const msg = "Only admins and resource owners can do this"
            const data = {
                message: `Permission denied`,
                reason : msg,
                owner  : false
            };
            throw req.user?.role === "guest" ? new Unauthorized(msg!, data) : new Forbidden(msg!, data);
        }
        
        const list = await Permission.sequelize!.query(
            `SELECT p.id, p.permission, p.action,
            CASE
                WHEN p.user_id IS NOT NULL THEN 'User'
                WHEN p.role    IS NOT NULL THEN 'Role'
                ELSE                            'UserGroup'
            END as "actorType",
            CASE
                WHEN p.user_id IS NOT NULL THEN u.email
                WHEN p.role    IS NOT NULL THEN p.role
                ELSE                            g.name
            END as "actor"
            FROM "Permissions" AS "p"
            LEFT JOIN "Users" u ON u.id = p.user_id
            LEFT JOIN "UserGroups" g ON g.id = p.user_group_id
            WHERE p.resource = ? AND p.resource_id=? AND (p.user_id IS NOT NULL OR p.user_group_id IS NOT NULL OR p.role IS NOT NULL)`,
            {
                replacements: [resourceType, +req.query.resource_id!],
                type: QueryTypes.SELECT
            }
        )

        res.json(list)
    }
})


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        res.json(await Permission.findAll({ ...lib.getFindOptions(req), user: req.user }));
    }
})

// Get one by ID ---------------------------------------------------------------
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
        const model = await Permission.findByPk(+req.params?.id, { user: req.user })
        assert(model, NotFound)
        res.json(model)
    }
})

// update ----------------------------------------------------------------------
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
        const model = await Permission.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        res.json(await model.update(req.body, { user: req.user }))
    }
});

// Share -----------------------------------------------------------------------
route(router, {
    path: "/grant",
    method: "post",
    async handler(req, res) {
        const transaction = await Permission.sequelize!.transaction()
        try {
            const {
                message,
                resource,
                resource_id,
                email,
                role,
                user_group_id,
                action
            } = req.body
            
            const params = await validate({
                resource,
                resource_id,
                email,
                role,
                user_group_id,
                action,
                permission: true
            })

            const rows = lib.explode([params])
            for (const row of rows) {
                await Permission.upsert(row, { transaction, user: req.user })
            }
            await transaction.commit()
            
            // FIXME: Make the email generic enough to handle sharing of anything and not only charts
            if (email && resource === "Graphs") {
                notifyForGraphsAccess({
                    actions: makeArray(action ?? []),
                    emails : makeArray(email ?? []),
                    graphId: makeArray(resource_id ?? []),
                    baseUrl: lib.getRequestBaseURL(req),
                    message
                })
            }

            res.json({ ok: true })
        } catch (error) {
            console.error(error)
            await transaction.rollback()
            throw error
        }
    }
});

// Revoke ----------------------------------------------------------------------
route(router, {
    path: "/revoke",
    method: "post",
    async handler(req, res) {
        const transaction = await Permission.sequelize!.transaction()
        try {
            const params = await validate({ ...req.body, permission: false })
            const rows = lib.explode([params])
            for (const row of rows) {
                await Permission.destroy({
                    where: { ...row, permission: false },
                    transaction
                })
            }
            await transaction.commit()
            res.json({ ok: true })
        } catch (error) {
            console.error(error)
            await transaction.rollback()
            res.status(500).json({ ok: false })
        }
    }
});

// Bulk Delete -----------------------------------------------------------------
route(router, {
    path: "/",
    method: "delete",
    request: {
        schema: {
            id: {
                in: ['query'],
                isString: {
                    errorMessage: "The 'id' parameter must be a comma-separated list of IDs to delete"
                }
            }
        }
    },
    handler: async (req, res) => {
        const ids = String(req.query.id).trim().split(",").map(parseFloat)
        const result = await Permission.destroy({
            where: {
                id: {
                  [Op.in]: ids,
                },
            },
            user: req.user
        });
        res.json({ message: `Deleted ${result} records` })
    }
});


export default router
