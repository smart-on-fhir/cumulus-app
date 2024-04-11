import { DataTypes } from "sequelize"
import { MigrationFunction } from "../../types";


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!("transmissions" in cols)) {
        await queryInterface.addColumn('DataRequests', 'transmissions', { type: DataTypes.JSONB });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if ("transmissions" in cols) {
        await queryInterface.removeColumn('DataRequests', 'transmissions');
    }
}