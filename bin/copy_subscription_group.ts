import { QueryTypes, Transaction } from "sequelize"
import { Agent }                   from "./Agent"
import { SITES }                   from "./config"
import { copySubscription }        from "./copy_subscription"



/**
 * @param {Object}  options
 * @param {Agent}   options.src
 * @param {Agent}   options.dst
 * @param {number}  options.srcSubscriptionGroupId
 * @param {Transaction} [options.transaction]
 */
async function copySubscriptionGroup(options: {
    src: Agent
    dst: Agent
    srcSubscriptionGroupId: number
    transaction?: Transaction
}) {
    const { src, dst, srcSubscriptionGroupId, transaction } = options

    // Find the group at src
    // -------------------------------------------------------------------------
    const group: any = (await src.connection.query(
        `SELECT * FROM "RequestGroups" WHERE "id" = ?`,
        {
            type: QueryTypes.SELECT,
            replacements: [ srcSubscriptionGroupId ]
        }
    ))[0];

    if (!group) {
        throw new Error(
            `No Subscription group with id=${srcSubscriptionGroupId
            } found in the source database.`
        )
    }

    // Create the group at dst
    // -------------------------------------------------------------------------
    const result = await dst.connection.query(
        `INSERT INTO "RequestGroups" ("description", "name") VALUES (?, ?) RETURNING "id"`,
        {
            transaction,
            type: QueryTypes.INSERT,
            replacements: [ group.description, group.name ]
        }
    ).catch(error => {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return Promise.reject(
                "The group name must be unique but a group with the same name already " +
                "exists at the destination. You will have to remove or rename it first."
            )
        }
        throw error
    })

    const newGroupId = result[0][0].id


    // Find group subscriptions at src
    // -------------------------------------------------------------------------
    const subscriptionRows: any = await src.connection.query(
        `SELECT * FROM "DataRequests" WHERE "groupId" = ?`,
        {
            type: QueryTypes.SELECT,
            replacements: [ srcSubscriptionGroupId ]
        }
    )

    // Copy group subscriptions to dst
    // -------------------------------------------------------------------------
    const size = subscriptionRows.length
    if (size) {
        console.log(`Found ${size} subscriptions in this group in the source database. Copying...`)
        for (const sub of subscriptionRows) {
            await copySubscription({
                src,
                dst,
                transaction,
                srcSubscriptionId: sub.id,
                dstSubscriptionGroupId: newGroupId
            })
        }
    } else {
        console.log(`No subscriptions found in this group in the source database.`)
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
        await copySubscriptionGroup({
            src: SRC,
            dst: DST,
            transaction,
            srcSubscriptionGroupId: id // 85
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
