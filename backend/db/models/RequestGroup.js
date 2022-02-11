const { DataTypes, Model } = require("sequelize")

module.exports = class RequestGroup extends Model
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
            }
        }, {
            sequelize,
            modelName: "RequestGroup"
        });
    };

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static associate(sequelize) {
        sequelize.models.RequestGroup.hasMany(
            sequelize.models.DataRequest,
            {
                as: "requests",
                foreignKey: "groupId"
            }
        );
    }
}