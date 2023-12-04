import BaseModel from "./BaseModel"
import {
    Sequelize,
    DataTypes,
    InferCreationAttributes,
    InferAttributes,
    CreationOptional,
    HasManySetAssociationsMixin
} from "sequelize"
import User from "./User";


export default class UserGroup extends BaseModel<InferAttributes<UserGroup>, InferCreationAttributes<UserGroup>>
{
    declare id         : CreationOptional<number>;
    declare name       : string;
    declare description: CreationOptional<string | null>;
    declare createdAt  : CreationOptional<Date>;
    declare updatedAt  : CreationOptional<Date>;

    declare setUsers: HasManySetAssociationsMixin<User, number>;

    static initialize(sequelize: Sequelize) {
        UserGroup.init({
            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },
            name: {
                type     : DataTypes.STRING,
                allowNull: false,
                unique   : true,
                validate : {
                    max: 50
                }
            },
            description: {
                type     : DataTypes.STRING,
                allowNull: true,
                validate : {
                    max: 200
                }
            },
            createdAt: {
                type     : DataTypes.DATE,
                allowNull: true
            },
            updatedAt: {
                type     : DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            modelName: "UserGroup"
        });
    };
}
