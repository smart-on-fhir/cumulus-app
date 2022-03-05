const { DataTypes, Model } = require("sequelize");
const Activity = require("./Activity");



module.exports = class DataRequest extends Model
{
    toString() {
        return `DataRequest #${this.get("id")} ("${this.get("name")}")`;
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        DataRequest.init({
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
            
            refresh: {
                type: DataTypes.ENUM('manually', 'yearly', 'monthly', 'weekly', 'daily'),
                defaultValue: "manually",
                allowNull: false
            },

            completed: {
                type: DataTypes.DATE
            },

            requestedData: {
                type: DataTypes.JSONB
            },
            
            data: {
                type: DataTypes.JSONB,
                defaultValue: null,
                validate: {
                    /**
                     * 
                     * @param {import("../../../index").app.DataRequestData} data 
                     */
                    isValidData(data) {
                        if (data !== null)  {
                            const cntColumn = data.cols.find(c => c.name === "cnt");
                            const colsLength = data.cols.length;
                            if (!cntColumn) {
                                throw new Error('Data must have "cnt" column for aggregate counts');
                            }
                            if (cntColumn.dataType !== "integer") {
                                throw new Error('The dataType of the "cnt" column must be "integer');
                            }

                            data.rows.forEach((row, rowIndex) => {
                                const rowLength = row.length
                                if (rowLength !== colsLength) {
                                    throw new Error(`Invalid data at row ${rowIndex}. Expected ${colsLength} columns but found ${rowLength}`);
                                }

                                // TODO: Validate data types
                                // row.forEach(cell => {

                                // })
                            })
                        }
                    }
                }
            },

            groupId: {
                type        : DataTypes.INTEGER,
                allowNull   : false,
                defaultValue: 1
            },

            dataURL: {
                type: DataTypes.STRING(500)
            }
        }, {
            sequelize,
            modelName: "DataRequest",
            hooks: {

                /**
                 * When data is imported, make sure we update the "completed"
                 * column to the current date.
                 * @param {DataRequest} model 
                 */
                async beforeUpdate(model) {
                    if (model.getDataValue("data")) {
                        model.set("completed", new Date())
                    }
                },

                async afterCreate(model, { user }) {
                    await Activity.create({
                        message: `${model} created by ${user ? user.username : "system"}`,
                        tags   : "requests"
                    });
                },

                async afterUpdate(model, { user }) {
                    await Activity.create({
                        message: `${model} updated by ${user ? user.username : "system"}`,
                        tags   : "requests"
                    });
                },

                async afterDestroy(model, { user }) {
                    await Activity.create({
                        message: `${model} deleted by ${user ? user.username : "system"}`,
                        tags   : "requests"
                    });
                }
            }
        });
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static associate(sequelize) {
        sequelize.models.DataRequest.belongsTo(sequelize.models.RequestGroup, { as: "group" })
        sequelize.models.DataRequest.hasMany(sequelize.models.View)
    }
};

