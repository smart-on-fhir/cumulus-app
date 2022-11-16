import { Sequelize }        from "sequelize"
import { fixAutoIncrement } from "../backend/lib"


module.exports = async function(connection: Sequelize) {

    const { models } = connection

    await models.User.bulkCreate(require("./fixtures/Users"));
    await fixAutoIncrement(connection, models.User.tableName, "id");

    await models.DataSite.bulkCreate(require("./fixtures/DataSites"));
    await fixAutoIncrement(connection, models.DataSite.tableName, "id");

    await models.Project.bulkCreate(require("./fixtures/Projects"));
    await fixAutoIncrement(connection, models.Project.tableName, "id");

}
