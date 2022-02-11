const { DataTypes, Model } = require("sequelize")

// CREATE TABLE "data_requests"(
// 	"id"          Integer  NOT NULL PRIMARY KEY AUTOINCREMENT,
// 	"name"        Text     NOT NULL,
// 	"description" Text,
// 	"groupID"     Integer,
// 	"refresh"     Text,  -- null | daily | weekly | monthly | yearly
// 	"created"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// 	"completed"   TIMESTAMP,
// 	"cols"        Text,  -- JSON
// 	"rows"        Text   -- JSON
// );

module.exports = class DataRequest extends Model
{
    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        DataRequest.init({
            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },
            
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            
            description: {
                type: DataTypes.STRING(500)
            },
            
            // groupID: {
            //     type: DataTypes.INTEGER
            // },

            refresh: {
                type: DataTypes.TEXT
            },

            completed: {
                type: DataTypes.DATE
            },
            
            data: {
                type: DataTypes.JSON
            }
        }, {
            sequelize,
            modelName: "DataRequest"
        });
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static associate(sequelize) {
        sequelize.models.DataRequest.belongsTo(sequelize.models.RequestGroup, { as: "group" })
        sequelize.models.DataRequest.hasMany(sequelize.models.View, { foreignKey: "dataSourceId" })
    }
};

