import { DataTypes, QueryInterface } from "sequelize"

export async function up(queryInterface: QueryInterface) {
    await queryInterface.changeColumn('DataRequests', 'description', {
        type: DataTypes.TEXT
    });
}

export async function down(queryInterface: QueryInterface) {
	await queryInterface.changeColumn('DataRequests', 'description', {
        type: DataTypes.STRING(500)
    });
}
