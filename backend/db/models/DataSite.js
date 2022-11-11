const { DataTypes, Model } = require("sequelize");
const Activity = require("./Activity");

module.exports = class DataSite extends Model
{
    toString() {
        return `DataSite #${this.get("id")} ("${this.get("name")}")`;
    }

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
            modelName: "DataSite",
            hooks: {
                async afterCreate(model, { user }) {
                    await Activity.create({
                        message: `${model} created by ${user ? user.name || "user #" + user.id : "system"}`,
                        tags   : "requests"
                    });
                },
                async afterUpdate(model, { user }) {
                    await Activity.create({
                        message: `${model} updated by ${user ? user.name || "user #" + user.id : "system"}`,
                        tags   : "requests"
                    });
                },
                async afterDestroy(model, { user }) {
                    await Activity.create({
                        message: `${model} deleted by ${user ? user.name || "user #" + user.id : "system"}`,
                        tags   : "requests"
                    });
                }
            }
        });
    };
}