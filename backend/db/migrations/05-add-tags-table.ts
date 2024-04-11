import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    await queryInterface.dropTable("Tags")
}
