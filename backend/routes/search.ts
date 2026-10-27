import express, { Request, Router } from "express"
import { QueryTypes }               from "sequelize"
import { route }                    from "../lib/route"
import Tag                          from "../db/models/Tag"
import config                       from "../config"
import * as aggregator              from "../aggregator"
import { uInt }                     from "../lib"


export const router: Router = express.Router({ mergeParams: true });

/**
 * Splits a search query into lowercase words. A name matches the query if it
 * contains all of them, in any order.
 */
export function getSearchTerms(q: string) {
    return q.toLowerCase().split(/\s+/).filter(Boolean)
}

export function matchesAllTerms(name: string, terms: string[]) {
    const lowerName = String(name || "").toLowerCase()
    return terms.every(term => lowerName.includes(term))
}

/**
 * Escapes the LIKE wildcards (% and _) so that they match literally
 */
export function escapeLike(term: string) {
    return term.replace(/[\\%_]/g, "\\$&")
}

async function search(terms: string[]) {
    const where = terms.length ?
        terms.map((_, i) => `"name" ilike :term${i}`).join(" and ") :
        `"name" is not null`

    const sql = `with "data" as (
              select "name", "description", "id", 'subscription'      as "type" from "DataRequests"
        union select "name", "description", "id", 'graph'             as "type" from "Views"
        union select "name", "description", "id", 'subscriptionGroup' as "type" from "SubscriptionGroups"
        union select "name", "description", "id", 'tag'               as "type" from "Tags"
        union select "name", "description", "id", 'studyArea'         as "type" from "Projects"
        ORDER BY "type", "name"
    ) SELECT * FROM "data" where ${where}`;

    return Tag.sequelize!.query(sql, {
        raw: true,
        replacements: Object.fromEntries(terms.map((term, i) => [`term${i}`, `%${escapeLike(term)}%`])),
        type: QueryTypes.SELECT
    })
}

function aggregatorIsEnabled() {
    return config.aggregator.enabled && config.aggregator.apiKey && config.aggregator.baseUrl
}

async function aggregatorRequest(url: string) {
    const { body } = await aggregator.request(url)
    return body
}


// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        const limit = uInt(req.query.limit)
        const terms = getSearchTerms(String(req.query.q || ""))
        let results = await search(terms)

        // Also search through package names from the aggregator
        if (aggregatorIsEnabled()) {
            const packages = await aggregatorRequest("/data-packages")
            results = results.concat(packages.filter((p: any) => matchesAllTerms(p.name, terms)).map((p: any) => ({
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