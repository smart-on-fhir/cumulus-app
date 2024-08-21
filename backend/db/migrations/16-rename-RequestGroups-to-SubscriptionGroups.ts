import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    if (await queryInterface.tableExists("RequestGroups")) {
        await queryInterface.renameTable("RequestGroups", "SubscriptionGroups");
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    if (await queryInterface.tableExists("SubscriptionGroups")) {
        await queryInterface.renameTable("SubscriptionGroups", "RequestGroups");
    }
}