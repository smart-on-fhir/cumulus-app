import { QueryTypes }    from "sequelize"
import clc               from "cli-color"
import { SITES }         from "./config"
import { Agent }         from "./Agent"
import { ReadOnlyPaths } from "../src/config"
import {
    ask,
    deletePath,
    hasPath,
    progress,
    sleep
}  from "./lib"



function createRemover(path: string) {
    return async function remove(rows, matches) {
        const updatedRowIds: number[] = []
        const answer = await ask(
            `Found ${matches.length} charts having a value at "${clc.bold(path)
            }", but that will be overridden at runtime. Would you like to remove it?`,
            { answers: ["yes", "no"], defaultValue: "no" }
        )
        if (answer === "yes") {
            rows = rows.map(row => {
                if (matches.includes(row.id)) {
                    deletePath(row, "settings.chartOptions." + path)
                    console.assert(
                        !hasPath(row, "settings.chartOptions." + path),
                        `Failed removing path "settings.chartOptions.${path}"`
                    )
                    updatedRowIds.push(row.id)
                }
                return row
            })
        }
        return updatedRowIds
    }
}

const Checks = {}

for (const path of ReadOnlyPaths) {
    Checks[path] = {
        matcher: row => hasPath(row.settings.chartOptions, path),
        updater: createRemover(path)
    };
}


/**
 * @param {{ id: number; name: string; settings: { chartOptions: import("highcharts").Options }}[]} rows 
 * @param { Sequelize } connection
 */
export async function healthCheck2(rows, connection) {
    
    /**
     * Every check will have an array of graph IDs that matched
     * @type { Record<string, number[]> }
     */
    const dirty = {}

    const checkIds = Object.keys(Checks)

    // Check every graph against every check and populate the dirty object
    for (const row of rows) {
        for (const checkId of checkIds) {
            const check = Checks[checkId]
            if (check.matcher(row)) {
                if (!dirty[checkId]) {
                    dirty[checkId] = []
                }
                dirty[checkId].push(row.id)
            }
        }
    }

    // Prepare a report table containing what was found and what will be fixed 
    const table = {}
    for (const checkId in dirty) {
        table[checkId] = { found: dirty[checkId].length }
    }

    let fixIdsMap: Record<string, any> = {}
    
    // Ask what the user wants to fix
    for (const checkId of checkIds) {
        const check = Checks[checkId]
        if (dirty[checkId]?.length) {
            const fixed = await check.updater(rows, dirty[checkId])
            if (fixed) {
                fixed.forEach(id => fixIdsMap[id] = 1)
                table[checkId].fixed = table[checkId].fixed ?? 0 + fixed.length
            }
        }
    }

    const fixIds = Object.keys(fixIdsMap).map(parseFloat)

    if (!fixIds.length) {
        console.log("All graphs appear to be up to date. There is nothing that needs fixing.")
        return;
    }

    // Show the preview table
    console.table(table)

    const answer = await ask(`${clc.bold(fixIds.length)} records will be updated. Do you confirm?`, { answers: ["yes", "no"], defaultValue: "no" })
    if (answer === "yes") {
        // console.log("Updating. Please wait...")
        const transaction = (await connection.transaction());
        try {
            const total = fixIds.length
            let i = 0
            for (const id of fixIds) {
                const row = rows.find(r => r.id === id)
                const sql = 'UPDATE "Views" SET "settings" = ? WHERE "id" = ?'
                await connection.query(sql, {
                    type: QueryTypes.UPDATE,
                    replacements: [
                        JSON.stringify(row?.settings),
                        id
                    ],
                    transaction
                })
                progress(++i/total * 100, `Updating graph #${id}`)
                await sleep(120)
            }
            await transaction.commit()
        } catch (ex) {
            console.error(ex)
            await transaction.rollback()
        }
    }
}


export default async function main(siteId: keyof typeof SITES) {
    const agent = Agent.for(SITES[siteId])
    await agent.connect()
    
    const result: any = await agent.query('SELECT * FROM "Views" ORDER BY "id"', { type: QueryTypes.SELECT })

    await healthCheck2(result, agent.connection)

    await agent.disconnect()
    process.exit(0)
}
