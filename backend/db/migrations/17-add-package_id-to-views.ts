import { DataTypes }         from "sequelize"
import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if (!("packageId" in cols)) {
        await queryInterface.addColumn('Views', 'packageId', { type: DataTypes.STRING(), allowNull: true });
        await queryInterface.changeColumn('Views', 'subscriptionId', { type: DataTypes.INTEGER, allowNull: true })
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    const cols = await queryInterface.describeTable("Views");
    if ("packageId" in cols) {
        await queryInterface.removeColumn('Views', 'packageId');
        await queryInterface.changeColumn('Views', 'subscriptionId', { type: DataTypes.INTEGER, allowNull: false })
    }
}