import { QueryInterface } from "sequelize"


export async function up(queryInterface: QueryInterface) {}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("Tags")
}
