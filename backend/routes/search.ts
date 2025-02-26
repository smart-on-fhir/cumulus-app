import express, { Request } from "express"
import { QueryTypes }       from "sequelize"
import { route }            from "../lib/route"
import Tag                  from "../db/models/Tag"
import config               from "../config"
import { uInt }             from "../lib"


export const router = express.Router({ mergeParams: true });

async function search(q: string) {
    const sql = `with "data" as (
              select "name", "description", "id", 'Data Source'       as "type" from "DataRequests"
        union select "name", "description", "id", 'Graph'             as "type" from "Views"
        union select "name", "description", "id", 'Data Source Group' as "type" from "SubscriptionGroups"
        union select "name", "description", "id", 'Tag'               as "type" from "Tags"
        union select "name", "description", "id", 'Study Area'        as "type" from "Projects"
        ORDER BY "type", "name"
    ) SELECT * FROM "data" where "name" ilike :query`;

    return Tag.sequelize!.query(sql, {
        raw: true,
        replacements: { query: `%${q}%` },
        type: QueryTypes.SELECT
    })
}

let CACHE: any;

function aggregatorIsEnabled() {
    return config.aggregator.enabled && config.aggregator.apiKey && config.aggregator.baseUrl
}

async function aggregatorRequest(req: Request, url: string) {
    const { apiKey, baseUrl } = config.aggregator

    if (CACHE && req.headers["cache-control"] !== "no-cache") {
        return CACHE
    }
    
    const response = await fetch(new URL(url, baseUrl), {
        headers: {
            "x-api-key": apiKey,
            accept: "application/json"
        }
    })

    CACHE = (async () => {
        const txt = await response.text()
        const type = response.headers.get("content-type")
        if (type && type.match(/\bjson\b/i)) {
            return JSON.parse(txt || "null")
        }
        return txt
    })()

    return CACHE
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
            const packages = await aggregatorRequest(req, "/data-packages")
            results = results.concat(packages.filter(p => p.name.toLowerCase().includes(q)).map(p => ({
                name: p.name,
                description: null,
                id: p.id,
                type: "Data Package",
                study: p.study
            })))
        }

        res.json({
            total  : results.length,
            results: limit ? results.slice(0, limit) : results
        })
    }
})