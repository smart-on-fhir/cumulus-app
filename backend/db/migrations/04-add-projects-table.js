const { DataTypes, QueryInterface } = require('sequelize');
const config                        = require("../../config");


/**
 * @param {QueryInterface} queryInterface 
 */
async function up(queryInterface) {

    // We don't need to do anything if the DB is fully recreated
    // From the model definitions, because the new columns are
    // already defined in the model
    if (config.db.sync === "force") {
        return true;
    }

    await queryInterface.createTable("Projects", {
        id: {
            type         : DataTypes.INTEGER,
            allowNull    : false,
            primaryKey   : true,
            autoIncrement: true
        },
        name: {
            type     : DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type     : DataTypes.TEXT,
            allowNull: false
        },
        creatorId: {
            type     : DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type     : DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type     : DataTypes.DATE,
            allowNull: false
        }
    });
    
}

/**
 * @param {QueryInterface} queryInterface 
 */
async function down(queryInterface) {
    await queryInterface.dropTable("Projects")
}

module.exports = { up, down };