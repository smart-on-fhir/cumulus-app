import { DataTypes } from "sequelize"
    

export async function up({ context: queryInterface }) {
    const cols = await queryInterface.describeTable("Views");
    if (!('isDraft' in cols)) {
        await queryInterface.addColumn('Views', 'isDraft', {
            type        : DataTypes.BOOLEAN,
            allowNull   : true,
            defaultValue: false
        });
    }
}

export async function down({ context: queryInterface }) {
    const cols = await queryInterface.describeTable("Views");
    if ('isDraft' in cols) {
        await queryInterface.removeColumn('Views', 'isDraft');
    }
}