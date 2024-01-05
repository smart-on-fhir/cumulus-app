import { QueryInterface } from "sequelize"
import { DataTypes }      from "sequelize"
    

export async function up(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("Users");
    if (!('activateUntil' in cols)) {
        await queryInterface.addColumn('Users', 'activateUntil', {
            type        : DataTypes.DATE,
            allowNull   : true
        });
    }
}

export async function down(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("Users");
    if ('activateUntil' in cols) {
        await queryInterface.removeColumn('Users', 'activateUntil');
    }
}