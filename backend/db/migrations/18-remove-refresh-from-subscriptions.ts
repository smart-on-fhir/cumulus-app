import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if ('refresh' in cols) {
        await queryInterface.removeColumn('DataRequests', 'refresh');
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("DataRequests");
    if (!('refresh' in cols)) {
        await queryInterface.addColumn('DataRequests', 'refresh', {
            type        : DataTypes.ENUM('manually', 'yearly', 'monthly', 'weekly', 'daily'),
            defaultValue: "manually",
            allowNull   : false
        });
    }
}
