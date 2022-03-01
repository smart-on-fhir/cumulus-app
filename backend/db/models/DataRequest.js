const { DataTypes, Model } = require("sequelize")

// CREATE TABLE "data_requests"(
// 	"id"          Integer  NOT NULL PRIMARY KEY AUTOINCREMENT,
// 	"name"        Text     NOT NULL,
// 	"description" Text,
// 	"groupID"     Integer,
// 	"refresh"     Text,  -- null | daily | weekly | monthly | yearly
// 	"created"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// 	"completed"   TIMESTAMP,
// 	"cols"        Text,  -- JSON
// 	"rows"        Text   -- JSON
// );

module.exports = class DataRequest extends Model
{
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
            }
        }, {
            sequelize,
            modelName: "DataRequest",
            hooks: {

                /**
                 * When data is imported, make sure we update the "completed"
                 * column to the current date.
                 * @param {DataRequest} instance 
                 */
                beforeUpdate(instance) {
                    if (instance.getDataValue("data")) {
                        instance.set("completed", new Date())
                    }
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

