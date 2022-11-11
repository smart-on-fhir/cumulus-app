const { fixAutoIncrement } = require("../backend/lib");

/**
 * @param {import("sequelize").Sequelize} connection
 */
module.exports = async (connection) => {

    const { models } = connection

    await models.User.bulkCreate(require("./fixtures/Users"));
    await fixAutoIncrement(connection, models.User.tableName, "id");

    await models.DataSite.bulkCreate(require("./fixtures/DataSites"));
    await fixAutoIncrement(connection, models.DataSite.tableName, "id");

};

