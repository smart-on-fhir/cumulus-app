import express        from "express"
import { Includeable } from "sequelize/types";
import Model          from "../../db/models/RequestGroup"
import * as HttpError from "../../errors";
import { route }      from "../../lib/route";
import createRestRoutes  from "../BaseController"


const router = express.Router({ mergeParams: true })

createRestRoutes(router, Model, {
    // getAll : "request_groups_list",
    getOne : "request_groups_view",
    create : "request_groups_create",
    update : "request_groups_update",
    destroy: "request_groups_delete"
});

// getAll ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    permission: "request_groups_list",
    request: {
        schema: {
            subscriptions: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    handler: async (req, res) => {
        const include: Includeable[] = [];
        
        if (req.query.subscriptions) {
            include.push({
                association: "requests",
                attributes: [
                    "id",
                    "name",
                    "completed"
                ],
                include: [
                    { association: "Views", attributes: ["name"] }
                ]
            })
        }
        
        try {
            const models = await Model.findAll({ include });
            res.json(models);
        } catch(error) {
            throw new HttpError.InternalServerError(`Error reading ${Model.name} models`);
        }
    }
});

// getOne ----------------------------------------------------------------------
// "request_groups_view"

// create ----------------------------------------------------------------------
// "request_groups_create"

// update ----------------------------------------------------------------------
// "request_groups_update"

// destroy ---------------------------------------------------------------------
// "request_groups_delete"


export default router
