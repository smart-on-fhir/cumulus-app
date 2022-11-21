const { DataTypes, Model } = require("sequelize");
const { logger } = require("../../logger");
// const Activity = require("./Activity");


class Project extends Model
{
    toString() {
        return `Project #${this.get("id")} ("${this.get("name")}")`;
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
            modelName: "Project",
            hooks: {
                async afterCreate(model, { user }) {
                    logger.info(`${model} created by ${user ? user.email : "system"}`, { tags: ["ACTIVITY"] })
                },

                async afterUpdate(model, { user }) {
                    logger.info(`${model} updated by ${user ? user.email : "system"}`, { tags: ["ACTIVITY"] })
                },

                async afterDestroy(model, { user }) {
                    logger.info(`${model} deleted by ${user ? user.email : "system"}`, { tags: ["ACTIVITY"] })
                }
            }
        });
    }
}

module.exports = Project;
