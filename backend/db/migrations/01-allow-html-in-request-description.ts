import { DataTypes } from "sequelize"
import { MigrationFunction } from "../../types"

export const up: MigrationFunction = async ({ context }) => {
    await context.changeColumn('DataRequests', 'description', {
        type: DataTypes.TEXT
    });
}

export const down: MigrationFunction = async ({ context }) => {
	await context.changeColumn('DataRequests', 'description', {
        type: DataTypes.STRING(500)
    });
}
