import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if ('DataRequestId' in cols) {
        await queryInterface.renameColumn('Views', 'DataRequestId', 'subscriptionId');
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if ('subscriptionId' in cols) {
        await queryInterface.renameColumn('Views', 'subscriptionId', 'DataRequestId');
    }
}