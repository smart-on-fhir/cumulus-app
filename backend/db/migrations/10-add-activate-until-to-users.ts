import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"
    

export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Users");
    if (!('activateUntil' in cols)) {
        await queryInterface.addColumn('Users', 'activateUntil', {
            type        : DataTypes.DATE,
            allowNull   : true
        });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Users");
    if ('activateUntil' in cols) {
        await queryInterface.removeColumn('Users', 'activateUntil');
    }
}