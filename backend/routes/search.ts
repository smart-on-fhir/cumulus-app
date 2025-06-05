import express, { Request, Router } from "express"
import { QueryTypes }               from "sequelize"
import { route }                    from "../lib/route"
import Tag                          from "../db/models/Tag"
import config                       from "../config"
import * as aggregator              from "../aggregator"
import { uInt }                     from "../lib"


export const router: Router = express.Router({ mergeParams: true });

async function search(q: string) {
    const sql = `with "data" as (
              select "name", "description", "id", 'subscription'      as "type" from "DataRequests"
        union select "name", "description", "id", 'graph'             as "type" from "Views"
        union select "name", "description", "id", 'subscriptionGroup' as "type" from "SubscriptionGroups"
        union select "name", "description", "id", 'tag'               as "type" from "Tags"
        union select "name", "description", "id", 'studyArea'         as "type" from "Projects"
        ORDER BY "type", "name"
    ) SELECT * FROM "data" where "name" ilike :query`;

    return Tag.sequelize!.query(sql, {
        raw: true,
        replacements: { query: `%${q}%` },
        type: QueryTypes.SELECT
    })
}

function aggregatorIsEnabled() {
    return config.aggregator.enabled && config.aggregator.apiKey && config.aggregator.baseUrl
}

async function aggregatorRequest(url: string) {
    const { body } = await aggregator.request(url, { cache: "default" })
    return body
}


// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        const limit = uInt(req.query.limit)
        const q = String(req.query.q || "")
        let results = await search(q)

        // Also search through package names from the aggregator
        if (aggregatorIsEnabled()) {
            const packages = await aggregatorRequest("/data-packages")
            results = results.concat(packages.filter((p: any) => p.name.toLowerCase().includes(q)).map((p: any) => ({
                name       : p.name,
                description: null,
                id         : p.id,
                type       : "dataPackage",
                study      : p.study,
                version    : p.version
            })))
        }

        res.json({
            total  : results.length,
            results: limit ? results.slice(0, limit) : results
        })
    }
})