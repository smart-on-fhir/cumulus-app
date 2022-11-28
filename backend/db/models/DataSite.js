const { DataTypes } = require("sequelize");
const { default: BaseModel } = require("./BaseModel");

module.exports = class DataSite extends BaseModel
{
    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        DataSite.init({
            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },

            description: {
                type: DataTypes.STRING,
                allowNull: false
            },

            // 0° to 90°
            lat: {
                type: DataTypes.INTEGER,
            },

            // -180° to 180°
            long: {
                type: DataTypes.INTEGER
            }
        }, {
            sequelize,
            modelName: "DataSite"
        });
    };
}