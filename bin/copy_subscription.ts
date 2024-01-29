import { QueryTypes, Transaction } from "sequelize"
import { Agent }                   from "./Agent"
import { progress }                from "./lib"
import { SITES }                   from "./config"


export async function copyDataTable(options: {
    src: Agent
    dst: Agent
    srcTableName: string
    dstTableName: string
    transaction?: Transaction
}) {
    console.log("Please wait...")

    const { src, dst, srcTableName, dstTableName = srcTableName, transaction } = options
    const BATCH_SIZE = 100_000

    const cntRow: any = (await src.query(`SELECT COUNT(*) FROM "${srcTableName}"`, { type: QueryTypes.SELECT }))[0]
    const cnt = cntRow.count * 1
    const cols = await src.connection.getQueryInterface().describeTable(srcTableName)
    
    const colsSql: string[] = []
    for (const key in cols) {
        const col = cols[key]
        const def = [col.type]
        if (!col.allowNull) {
            def.push("NOT NULL")
        }
        if (col.defaultValue !== null) {
            def.push("DEFAULT", col.defaultValue)
        }
        if (col.comment) {
            def.push("COMMENT", col.comment)
        }

        colsSql.push([key, ...def].join(" "))
    }

    let sql1 = `CREATE TABLE "${dstTableName}" (\n    ${colsSql.join(",\n    ")}\n)`
    let sql2 = `CREATE UNIQUE INDEX "${dstTableName}_unique" ON "${dstTableName}" USING btree(\n    ${
        Object.keys(cols)
            .filter(k => k !== "cnt" && k !== "cnt_min" && k !== "cnt_max")
            .map(k => `"${k}" Asc NULLS Last`)
            .join(",\n    ")
    }\n)`
    
    await dst.query(sql1, { transaction })
    
    const queryInterface = dst.connection.getQueryInterface()
    
    let offset = 0, size = 0
    do {
        const sort = Object.keys(cols)
            .filter(k => k !== "cnt" && k !== "cnt_min" && k !== "cnt_max")
            .map(k => `"${k}" Asc NULLS Last`)
            .join(", ")
        const rows: any[] = await src.query(
            `SELECT * FROM "${srcTableName}" ORDER BY ${sort} LIMIT ${BATCH_SIZE} OFFSET ${offset}`,
            { type: QueryTypes.SELECT }
        )
        size = rows.length
        if (size) {
            await queryInterface.bulkInsert(dstTableName, rows, { raw: true, transaction })
            offset += size
            progress(offset/cnt * 100, `Copied ${offset.toLocaleString()} of ${cnt.toLocaleString()} rows`)
        }
    } while (size)

    process.stdout.write('\r');
    process.stdout.clearLine(0);

    await dst.query(sql2, { transaction })
}

/**
 * Copies a subscription and it's data (if any)
 */
export async function copySubscription(options: {
    src: Agent
    dst: Agent
    srcSubscriptionId: number
    dstSubscriptionGroupId?: number|null
    transaction?: Transaction
}) {

    const { src, dst, srcSubscriptionId, transaction, dstSubscriptionGroupId = null } = options

    // Find and prepare the source Subscription record
    // -------------------------------------------------------------------------
    const rows = await src.connection.query(
        'SELECT * FROM "DataRequests" WHERE "id" = ?',
        { type: QueryTypes.SELECT, replacements: [ srcSubscriptionId ] }
    )

    const row: any = rows[0]

    if (!row) {
        throw new Error(
            `No "DataRequests" record with id of "${srcSubscriptionId}" found in the source database`
        )
    }

    row.groupId = dstSubscriptionGroupId
    delete row.id
    

    // Insert the Subscription record into destination
    // -------------------------------------------------------------------------
    const props = Object.keys(row)
    const result = await dst.connection.query(`INSERT INTO "DataRequests" (${
        props.map(x => dst.connection.getQueryInterface().quoteIdentifier(x)).join(", ")
    }) VALUES (${props.map(x => "?").join(", ")}) RETURNING "id"`, {
        transaction,
        type: QueryTypes.INSERT,
        replacements: props.map(x => row[x] && typeof row[x] === "object" ? JSON.stringify(row[x]) : row[x])
    })

    const newSubscriptionId = result[0][0].id
    console.log(`Created new "DataRequests" record with id "${newSubscriptionId}" in the destination database`)

    // Check if data is available at src
    // -------------------------------------------------------------------------
    const hasData = await src.connection.getQueryInterface().tableExists(
        `subscription_data_${srcSubscriptionId}`
    )

    // Copy the data to destination
    // -------------------------------------------------------------------------
    if (hasData) {
        console.log(`Found data for this subscription in the source database. Copying...`)
        await copyDataTable({
            src,
            dst,
            srcTableName: `subscription_data_${srcSubscriptionId}`,
            dstTableName: `subscription_data_${newSubscriptionId}`,
            transaction
        })
        console.log(`Created data table "subscription_data_${newSubscriptionId}" in the source database.`)
    } else {
        console.log(`No data found for this subscription in the source database.`)
    }

    // Copy subscription graphs (if any)
    // -------------------------------------------------------------------------
    await copySubscriptionGraphs({
        src,
        dst,
        srcSubscriptionId,
        dstSubscriptionId: newSubscriptionId,
        transaction
    })
}


/**
 * Copies a subscription and it's data (if any)
 */
export async function copySubscriptionGraphs(options: {
    src: Agent
    dst: Agent
    srcSubscriptionId: number
    dstSubscriptionId: number
    transaction?: Transaction
}) {

    const { src, dst, srcSubscriptionId, dstSubscriptionId, transaction } = options

    const viewRows: any[] = await src.connection.query(`SELECT * FROM "Views" WHERE "DataRequestId" = ?`, {
        type: QueryTypes.SELECT,
        replacements: [ srcSubscriptionId ]
    })

    const size = viewRows.length
    if (size) {
        console.log(`Found ${size} graphs for this subscription in the source database. Copying...`)
        await dst.connection?.getQueryInterface().bulkInsert("Views", viewRows.map(r => {
            r.DataRequestId = dstSubscriptionId
            delete r["id"]
            r.settings = JSON.stringify(r.settings)
            return r
        }), { transaction })
    } else {
        console.log(`No graphs found for this subscription in the source database.`)
    }
}


export default async function main({ src, dst, id }: Record<string, any>) {

    if (src === dst) {
        throw new Error("Source and destinations cannot be the same")
    }

    const SRC = Agent.for(SITES[src])
    await SRC.connect()

    const DST = Agent.for(SITES[dst])
    await DST.connect()

    const transaction = await DST.connection.transaction();

    try {
        await copySubscription({
            src: SRC,
            dst: DST,
            srcSubscriptionId: id,
            transaction
        })

        await transaction.commit()
        console.log("DONE!")
    }
    catch (e) {
        console.error(e)
        await transaction.rollback()
    }
    finally {
        await SRC.disconnect()
        await DST.disconnect()
    }
}


