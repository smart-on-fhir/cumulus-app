import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!("metadata" in cols)) {
        await queryInterface.addColumn('DataRequests', 'metadata', { type: DataTypes.JSONB });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if ("metadata" in cols) {
        await queryInterface.removeColumn('DataRequests', 'metadata');
    }
}
