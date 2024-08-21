import BaseModel from "./BaseModel"
import {
    Sequelize,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from "sequelize"


export default class SubscriptionGroup extends BaseModel<InferAttributes<SubscriptionGroup>, InferCreationAttributes<SubscriptionGroup>>
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
        SubscriptionGroup.init({
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
            modelName: "SubscriptionGroup",
            tableName: "SubscriptionGroups"
        });
    };
}