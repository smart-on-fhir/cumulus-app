import { Sequelize }    from "sequelize"
import users            from "./users"
import data_sites       from "./data_sites"
import projects         from "./projects"
import request_groups   from "./request_groups"
import data_requests    from "./data_requests"
import views            from "./views"
import tags             from "./tags"
import dataRequestsTags from "./data_requests_tags"
import viewsTags        from "./views_tags"


export default async function seed(connection: Sequelize) {
    await seedTable(connection, "User"        , users         )
    await seedTable(connection, "DataSite"    , data_sites    )
    await seedTable(connection, "Project"     , projects      )
    await seedTable(connection, "RequestGroup", request_groups)
    await seedTable(connection, "DataRequest" , data_requests )
    await seedTable(connection, "View"        , views         )
    await seedTable(connection, "Tag"         , tags          )
    
    await connection.models.DataRequestsTags.bulkCreate(dataRequestsTags, { ignoreDuplicates: true })
    await connection.models.ViewsTags.bulkCreate(viewsTags, { ignoreDuplicates: true })
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