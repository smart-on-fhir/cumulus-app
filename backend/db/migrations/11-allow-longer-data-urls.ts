import { DataTypes, QueryInterface } from "sequelize"

export async function up(queryInterface: QueryInterface) {
    await queryInterface.changeColumn('DataRequests', 'dataURL', {
        type: DataTypes.STRING(50_000)
    });
}

export async function down(queryInterface: QueryInterface) {
	await queryInterface.changeColumn('DataRequests', 'dataURL', {
        type: DataTypes.STRING(500)
    });
}