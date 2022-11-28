const { DataTypes } = require("sequelize");
const { default: BaseModel } = require("./BaseModel");


module.exports = class Project extends BaseModel
{
    isOwnedBy(user) {
        return user && user.id && user.id === this.get("creatorId")
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        Project.init({
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
                allowNull: false,
                validate: {
                    isValid: (value) => {
                        if (!String(value).trim()) {
                            throw new Error("description cannot be empty")
                        }
                    }
                }
            },
            creatorId: {
                type     : DataTypes.INTEGER,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: "Project"
        });
    }
}
