import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    await queryInterface.changeColumn('DataRequests', 'dataURL', {
        type: DataTypes.STRING(50_000)
    });
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
	await queryInterface.changeColumn('DataRequests', 'dataURL', {
        type: DataTypes.STRING(500)
    });
}
