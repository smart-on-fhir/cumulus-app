const { DataTypes } = require('sequelize');
const config        = require("../../config");

async function up(queryInterface) {

    // We don't need to do anything if the DB is fully recreated
    // From the model definitions, because the new columns are
    // already defined in the model
    if (config.db.sync === "force") {
        return true;
    }

    await queryInterface.addColumn('Views', 'rating', {
        type        : DataTypes.FLOAT,
        defaultValue: 0,
        allowNull   : false
    });
    await queryInterface.addColumn('Views', 'votes', {
        type        : DataTypes.INTEGER,
        defaultValue: 0,
        allowNull   : false
    });
    await queryInterface.addColumn('Views', 'normalizedRating', {
        type        : DataTypes.FLOAT,
        defaultValue: 0,
        allowNull   : false
    });
}

async function down(queryInterface) {
	await queryInterface.removeColumn('Views', 'rating');
    await queryInterface.removeColumn('Views', 'votes');
    await queryInterface.removeColumn('Views', 'normalizedRating');
}

module.exports = { up, down };