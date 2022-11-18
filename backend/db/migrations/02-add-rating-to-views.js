const { DataTypes } = require('sequelize');

async function up(queryInterface) {

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