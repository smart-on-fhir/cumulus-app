import { Sequelize }        from "sequelize"
import { fixAutoIncrement } from "../backend/lib"
import Users                from "./fixtures/Users"
import DataSites            from "./fixtures/DataSites"
import Projects             from "./fixtures/Projects"
import RequestGroups        from "./fixtures/RequestGroups"
import DataRequests         from "./fixtures/DataRequests"
import Views                from "./fixtures/Views"
import Permissions          from "./fixtures/Permissions"
import UserGroups           from "./fixtures/UserGroups"


export async function seed(connection: Sequelize) {

    const { models } = connection

    await models.User.bulkCreate(Users);
    await fixAutoIncrement(connection, models.User.tableName, "id");

    await models.DataSite.bulkCreate(DataSites);
    await fixAutoIncrement(connection, models.DataSite.tableName, "id");

    await models.Project.bulkCreate(Projects);
    await fixAutoIncrement(connection, models.Project.tableName, "id");

    await models.RequestGroup.bulkCreate(RequestGroups);
    await fixAutoIncrement(connection, models.RequestGroup.tableName, "id");

    await models.DataRequest.bulkCreate(DataRequests);
    await fixAutoIncrement(connection, models.DataRequest.tableName, "id");
    
    await models.View.bulkCreate(Views);
    await fixAutoIncrement(connection, models.View.tableName, "id");

    await models.Permission.bulkCreate(Permissions);
    await fixAutoIncrement(connection, models.Permission.tableName, "id");

    await models.UserGroup.bulkCreate(UserGroups);
    await fixAutoIncrement(connection, models.UserGroup.tableName, "id");

}
