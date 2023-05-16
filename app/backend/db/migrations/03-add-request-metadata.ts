import { QueryInterface, DataTypes } from "sequelize"


export async function up(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!("metadata" in cols)) {
        await queryInterface.addColumn('DataRequests', 'metadata', { type: DataTypes.JSONB });
    }
}

export async function down(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("DataRequests");
    if ("metadata" in cols) {
        await queryInterface.removeColumn('DataRequests', 'metadata');
    }
}
