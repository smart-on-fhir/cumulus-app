const { DataTypes } = require("sequelize");
const { default: BaseModel } = require("./BaseModel");


module.exports = class RequestGroup extends BaseModel
{
    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        RequestGroup.init({
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
                type: DataTypes.TEXT
            }
        }, {
            sequelize,
            modelName: "RequestGroup"
        });
    };

}