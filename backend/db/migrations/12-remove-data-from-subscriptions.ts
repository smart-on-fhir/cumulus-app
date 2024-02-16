import { QueryInterface, DataTypes } from "sequelize"
    

export async function down(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!('data' in cols)) {
        await queryInterface.addColumn('DataRequests', 'data', {
            type: DataTypes.JSONB,
            defaultValue: null,
        });
    }
}

export async function up(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("DataRequests");
    if ('data' in cols) {
        await queryInterface.removeColumn('DataRequests', 'data');
    }
}