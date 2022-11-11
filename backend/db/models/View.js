const { DataTypes, Model } = require("sequelize");
const Activity = require("./Activity");


class View extends Model
{
    /**
     * @type {string | undefined}
     */
    _screenShot;

    toString() {
        return `View #${this.get("id")} ("${this.get("name")}")`;
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static associate(sequelize) {
        sequelize.models.View.belongsTo(sequelize.models.DataRequest)
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        View.init({
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
            
            screenShot: {
                type: DataTypes.TEXT,
                get() {
                    const screenShot = this.getDataValue("screenShot");
                    const match = (/^data:image\/(.+?);base64,(.+)$/).exec(screenShot || "");

                    if (!match || match.length < 3) {
                        return null
                    }

                    return `/api/views/${this.getDataValue("id")}/screenshot.${match[1]}`
                }
            },

            settings: {
                type: DataTypes.JSONB
            },

            rating: {
                type        : DataTypes.FLOAT,
                defaultValue: 0,
                allowNull   : false
            },

            votes: {
                type        : DataTypes.INTEGER,
                defaultValue: 0,
                allowNull   : false
            },

            normalizedRating: {
                type        : DataTypes.FLOAT,
                defaultValue: 0,
                allowNull   : false
            }
        }, {
            sequelize,
            modelName: "View",
            hooks: {
                async afterCreate(model, { user }) {
                    await Activity.create({
                        message: `${model} created by ${user ? user.name || "user #" + user.id : "system"}`,
                        tags   : "views"
                    });
                },

                async afterUpdate(model, { user }) {
                    await Activity.create({
                        message: `${model} updated by ${user ? user.name || "user #" + user.id : "system"}`,
                        tags   : "views"
                    });
                },

                async afterDestroy(model, { user }) {
                    await Activity.create({
                        message: `${model} deleted by ${user ? user.name || "user #" + user.id : "system"}`,
                        tags   : "views"
                    });
                }
            }
        });
    }
}

module.exports = View;
