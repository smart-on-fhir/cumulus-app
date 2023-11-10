import BaseModel from "./BaseModel"
import {
    Sequelize,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from "sequelize"


export default class RequestGroup extends BaseModel<InferAttributes<RequestGroup>, InferCreationAttributes<RequestGroup>>
{
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    getPublicName() {
        return "SubscriptionGroups"
    }

    static initialize(sequelize: Sequelize) {
        RequestGroup.init({
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
                type: DataTypes.TEXT
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, {
            sequelize,
            modelName: "RequestGroup"
        });
    };
}