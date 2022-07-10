const { DataTypes } = require('sequelize');
const config        = require("../../config");

async function up(queryInterface) {

    // We don't need to do anything if the DB is fully recreated
    // From the model definitions, because the new columns are
    // already defined in the model
    if (config.db.sync === "force") {
        return true;
    }

    const cols = await queryInterface.describeTable('DataRequests');
    if (!('metadata' in cols)) {
        await queryInterface.addColumn('DataRequests', 'metadata', {
            type: DataTypes.JSONB
        });
    }
}

async function down(queryInterface) {
    const cols = await queryInterface.describeTable('DataRequests');
    if ('metadata' in cols) {
	    await queryInterface.removeColumn('DataRequests', 'metadata');
    }
}

module.exports = { up, down };