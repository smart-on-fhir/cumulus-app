import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"
    

export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if (!('creatorId' in cols)) {
        await queryInterface.addColumn('Views', 'creatorId', {
            type        : DataTypes.INTEGER,
            allowNull   : true
        });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if ('creatorId' in cols) {
        await queryInterface.removeColumn('Views', 'creatorId');
    }
}