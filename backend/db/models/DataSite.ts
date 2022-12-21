import BaseModel from "./BaseModel"
import {
    Sequelize,
    DataTypes,
    InferCreationAttributes,
    InferAttributes,
    CreationOptional
} from "sequelize"


export default class DataSite extends BaseModel<InferAttributes<DataSite>, InferCreationAttributes<DataSite>>
{
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare lat: number | null;
    declare long: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static initialize(sequelize: Sequelize) {
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
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        }, {
            sequelize,
            modelName: "DataSite"
        });
    };
}
