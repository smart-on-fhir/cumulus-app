const { DataTypes }          = require("sequelize");
const { sendDataRequest }    = require("../../mail");
const { default: BaseModel } = require("./BaseModel");



module.exports = class DataRequest extends BaseModel
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
                type: DataTypes.TEXT
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

            metadata: {
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
                                throw new Error('The dataType of the "cnt" column must be "integer"');
                            }

                            // If we have data already, then column names cannot 

                            data.rows.forEach((row, rowIndex) => {

                                for (let i = row.length; i < colsLength; i++) {
                                    row.push(null)
                                }

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
                // allowNull   : false,
                // defaultValue: 1
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
                    if (model.changed("data")) {
                        model.set("completed", new Date())
                    }
                },

                async afterCreate(model) {
                    // Note that we don't wait for this to complete
                    sendDataRequest(model.toJSON()).catch(console.error);

                }
            }
        });
    }

};

