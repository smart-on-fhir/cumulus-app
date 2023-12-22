import {
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    DataTypes,
    Sequelize
} from "sequelize"

import BaseModel from "./BaseModel"


export default class Permission extends BaseModel<InferAttributes<Permission>, InferCreationAttributes<Permission>>
{
    declare id           : CreationOptional<number>;
    declare user_id      : number | null;
    declare role         : string | null;
    declare user_group_id: number | null;
    declare attribute    : string | null;
    declare resource     : string;
    declare resource_id  : CreationOptional<number | null>;
    declare action       : string;
    declare permission   : boolean;
    declare comment      : CreationOptional<string | null>;
    declare createdAt    : CreationOptional<Date>;
    declare updatedAt    : CreationOptional<Date>;

    public getPublicName() {
        return "Permissions"
    }

    static initialize(sequelize: Sequelize) {
        Permission.init({
            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            role: {
                type: DataTypes.STRING,
                allowNull: true
            },
            user_group_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            resource: {
                type: DataTypes.STRING,
                allowNull: false
            },
            resource_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            attribute: {
                type: DataTypes.STRING,
                allowNull: true
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false
            },
            permission: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            comment: {
                type: DataTypes.STRING,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            modelName: "Permission"
        })
    }
}