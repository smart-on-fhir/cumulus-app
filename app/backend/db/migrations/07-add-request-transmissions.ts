import { QueryInterface, DataTypes } from "sequelize"


export async function up(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!("transmissions" in cols)) {
        await queryInterface.addColumn('DataRequests', 'transmissions', { type: DataTypes.JSONB });
    }
}

export async function down(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("DataRequests");
    if ("transmissions" in cols) {
        await queryInterface.removeColumn('DataRequests', 'transmissions');
    }
}