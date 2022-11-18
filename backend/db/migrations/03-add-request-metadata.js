const { DataTypes } = require('sequelize');

async function up(queryInterface) {
    await queryInterface.addColumn('DataRequests', 'metadata', { type: DataTypes.JSONB });
}

async function down(queryInterface) {
    await queryInterface.removeColumn('DataRequests', 'metadata');
}

module.exports = { up, down };