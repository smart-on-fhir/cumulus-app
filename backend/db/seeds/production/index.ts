import { Sequelize }    from "sequelize"
import users            from "./users"
import tags             from "./tags"


export default async function seed(connection: Sequelize) {
    await seedTable(connection, "User", users)
    await seedTable(connection, "Tag", tags)
}

async function seedTable(connection: Sequelize, name: string, data: any[]) {
    const model = connection.models[name]
    await model.bulkCreate(data, { ignoreDuplicates: true });
    await fixAutoIncrement(connection, model.tableName, "id");
}

async function fixAutoIncrement(connection: Sequelize, tableName: string, incrementColumnName: string) {
    await connection.query(
        `select setval(
            '"${tableName}_${incrementColumnName}_seq"',
            (select max("${incrementColumnName}") from "${tableName}"),
            true
        )`
    );
}

// @ts-ignore
export = seed