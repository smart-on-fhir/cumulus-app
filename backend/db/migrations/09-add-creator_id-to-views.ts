import { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize"
    

export async function up(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("Views");
    if (!('creator_id' in cols)) {
        await queryInterface.addColumn('Views', 'creatorId', {
            type        : DataTypes.INTEGER,
            allowNull   : true
        });
    }
}

export async function down(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("Views");
    if ('creator_id' in cols) {
        await queryInterface.removeColumn('Views', 'creatorId');
    }
}