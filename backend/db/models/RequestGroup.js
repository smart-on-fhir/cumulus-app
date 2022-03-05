const { DataTypes, Model } = require("sequelize");
const Activity = require("./Activity");

module.exports = class RequestGroup extends Model
{
    toString() {
        return `RequestGroup #${this.get("id")} "${this.get("name")}"`;
    }

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
            modelName: "RequestGroup",
            hooks: {
                async afterCreate(model, { user }) {
                    await Activity.create({
                        message: `${model} created by ${user ? user.username : "system"}`,
                        tags   : "requests"
                    })
                }
            }
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