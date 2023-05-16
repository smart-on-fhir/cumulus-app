const { DataTypes, Op } = require("sequelize");
const moment = require("moment");
const { default: BaseModel } = require("./BaseModel");

module.exports = class Activity extends BaseModel
{

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        return Activity.init({
            type: {
                type: DataTypes.STRING
            },
            message: {
                type: DataTypes.STRING
            },
            tags: {
                type: DataTypes.STRING
            }
        }, {
            sequelize,
            modelName: "Activity",
            hooks: {
                afterCreate() {
                    Activity.destroy({
                        where: {
                            createdAt: {
                                [Op.lt]: moment().subtract(1, "month").toDate()
                            }
                        }
                    })
                }
            }
        });
    };
}
