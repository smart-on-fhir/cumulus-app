import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const oldExists = await queryInterface.tableExists("RequestGroups")
    const newExists = await queryInterface.tableExists("SubscriptionGroups")
    if (oldExists && !newExists) {
        await queryInterface.renameTable("RequestGroups", "SubscriptionGroups");
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const oldExists = await queryInterface.tableExists("RequestGroups")
    const newExists = await queryInterface.tableExists("SubscriptionGroups")
    if (!oldExists && newExists) {
        await queryInterface.renameTable("SubscriptionGroups", "RequestGroups");
    }
}