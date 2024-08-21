import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    await queryInterface.renameTable("RequestGroups", "SubscriptionGroups");
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    await queryInterface.renameTable("SubscriptionGroups", "RequestGroups");
}