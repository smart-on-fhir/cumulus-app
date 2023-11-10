import { Sequelize }        from "sequelize"
import { fixAutoIncrement } from "../../lib";


export async function seedTable(connection: Sequelize, name: string, data: any[]) {
    const model = connection.models[name]
    await model.bulkCreate(data, { ignoreDuplicates: true });
    await fixAutoIncrement(connection, model.tableName, "id");
}
