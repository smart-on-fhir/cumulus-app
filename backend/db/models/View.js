const { DataTypes, Model } = require("sequelize")


class View extends Model
{
    /**
     * @type {string | undefined}
     */
    _screenShot;

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
            }
        }, {
            sequelize,
            modelName: "View"
        });
    }
}

module.exports = View;
