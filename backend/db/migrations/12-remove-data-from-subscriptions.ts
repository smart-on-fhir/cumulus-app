import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"


export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!('data' in cols)) {
        await queryInterface.addColumn('DataRequests', 'data', {
            type: DataTypes.JSONB,
            defaultValue: null,
        });
    }
}

export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if ('data' in cols) {
        await queryInterface.removeColumn('DataRequests', 'data');
    }
}
