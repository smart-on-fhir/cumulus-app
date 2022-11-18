const { QueryInterface } = require('sequelize');


/**
 * @param {QueryInterface} queryInterface 
 */
async function up(queryInterface) {}

/**
 * @param {QueryInterface} queryInterface 
 */
async function down(queryInterface) {
    await queryInterface.dropTable("Tags")
}

module.exports = { up, down };