import { Sequelize }        from "sequelize"
import { fixAutoIncrement } from "../../lib";


export async function seedTable(connection: Sequelize, name: string, data: any[], autoIncrementColumn: string | null = "id") {
    const model = connection.models[name]
    const fields = Object.keys(data[0])
    await model.bulkCreate(data, { ignoreDuplicates: true, fields, returning: fields });
    if (autoIncrementColumn) {
        await fixAutoIncrement(connection, model.tableName, autoIncrementColumn);
    }
}
