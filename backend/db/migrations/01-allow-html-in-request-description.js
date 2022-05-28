const { DataTypes } = require('sequelize');
const config        = require("../../config");

async function up(queryInterface) {
    if (config.db.sync === "force") {
        return true;
    }

    await queryInterface.changeColumn('DataRequests', 'description', {
        type: DataTypes.TEXT
    });
}

async function down(queryInterface) {
	await queryInterface.changeColumn('DataRequests', 'description', {
        type: DataTypes.STRING(500)
    });
}

module.exports = { up, down };