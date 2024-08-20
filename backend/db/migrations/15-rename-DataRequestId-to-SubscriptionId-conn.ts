import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("ProjectsSubscriptions");
    if ('DataRequestId' in cols) {
        await queryInterface.renameColumn('ProjectsSubscriptions', 'DataRequestId', 'SubscriptionId');
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if ('subscriptionId' in cols) {
        await queryInterface.renameColumn('ProjectsSubscriptions', 'SubscriptionId', 'DataRequestId');
    }
}