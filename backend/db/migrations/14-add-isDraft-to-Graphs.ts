import { DataTypes } from "sequelize"
import { MigrationFunction } from "../../types"
    

export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if (!('isDraft' in cols)) {
        await queryInterface.addColumn('Views', 'isDraft', {
            type        : DataTypes.BOOLEAN,
            allowNull   : true,
            defaultValue: false
        });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if ('isDraft' in cols) {
        await queryInterface.removeColumn('Views', 'isDraft');
    }
}