const { DataTypes } = require('sequelize');

async function up(queryInterface) {
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