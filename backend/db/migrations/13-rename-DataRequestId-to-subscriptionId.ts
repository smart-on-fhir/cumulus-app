import { QueryInterface } from "sequelize"


export async function up(queryInterface: QueryInterface) {
    await queryInterface.renameColumn('Views', 'DataRequestId', 'subscriptionId');
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.renameColumn('Views', 'subscriptionId', 'DataRequestId');
}