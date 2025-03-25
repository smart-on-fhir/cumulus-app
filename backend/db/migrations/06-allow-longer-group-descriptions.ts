import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"

export const up: MigrationFunction = async ({ context: queryInterface }) => {
    if (await queryInterface.tableExists("RequestGroups")) {
        await queryInterface.changeColumn('RequestGroups', 'description', {
            type: DataTypes.TEXT
        });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
	if (await queryInterface.tableExists("RequestGroups")) {
        await queryInterface.changeColumn('RequestGroups', 'description', {
            type: DataTypes.STRING(255)
        });
    }
}