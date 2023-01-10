import express, { NextFunction, Response } from "express"
import moment                              from "moment"
import { requestPermission }               from "../acl"
import { combinedLogger }                  from "../logger"
import { route }                           from "../lib/route"
import { AppRequest }                      from ".."


const router = express.Router({ mergeParams: true });

route(router, {
    method: "get",
    path  : "/",
    request: {
        schema: {
            levels: {
                in: ["query"],
                optional: true
            },
            tags: {
                in: ["query"],
                optional: true
            },
            limit: {
                in: ["query"],
                optional: true,
                isInt: {
                    options: {
                        min: 1,
                        max: 1000
                    }
                }
            },
            from: {
                in: ["query"],
                optional: true,
                isDate: {
                    options: {
                        format: "YYYY-MM-DD"
                    }
                }
            },
            to: {
                in: ["query"],
                optional: true,
                isDate: {
                    options: {
                        format: "YYYY-MM-DD"
                    }
                }
            }
        }
    },
    async handler(req: AppRequest, res: Response, next: NextFunction) {
        requestPermission(req.user?.role || "guest", "Logs.read")
    
        const levels = String(req.query.levels || "").trim().split(/\s*,\s*/).filter(Boolean);

        const tags = String(req.query.tags || "").trim().split(/\s*,\s*/).filter(Boolean);

        const limit = +(req.query.limit || "100")

        let from = moment(String(req.query.from || ""), "YYYY-MM-DD")
        if (!from.isValid()) {
            from = moment().subtract(1, "day")
        }

        let to = moment(String(req.query.to || ""), "YYYY-MM-DD")
        if (!to.isValid()) {
            to = moment()
        }

        const options: any = {
            from  : from.startOf("day").toDate(),
            until : to.endOf("day").toDate(),
            // limit : 500 ,
            // start : 0,
            order : 'desc',
            // fields: [],
        };

        combinedLogger.query(options, (err, results) => {
            if (err) {
                return next(err);
            }

            let items = results.dailyRotateFile || [];

            if (levels.length) {
                items = items.filter((item: any) => levels.includes(item.level))
            }

            if (tags.length) {
                items = items.filter((item: any) => item.tags && item.tags.some((t: any) => tags.includes(t)))
            }

            items = items.splice(0, limit)

            res.json(items);
        });
    }
})

export default router
