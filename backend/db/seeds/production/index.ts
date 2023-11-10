import { Sequelize } from "sequelize"
import users         from "./users"
import tags          from "./tags"
import { seedTable } from "../lib"


export async function seed(connection: Sequelize) {
    await seedTable(connection, "User", users)
    await seedTable(connection, "Tag", tags)
}
