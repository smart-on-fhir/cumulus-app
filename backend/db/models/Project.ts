import BaseModel from "./BaseModel"
import {
    Sequelize,
    DataTypes,
    CreationOptional,
    InferAttributes,
    InferCreationAttributes
} from "sequelize"



export default class Project extends BaseModel<InferAttributes<Project>, InferCreationAttributes<Project>>
{
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare creatorId?: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    public isOwnedBy(user: any): boolean {
        return user && user.id && user.id === this.creatorId;
    }

    static initialize(sequelize: Sequelize) {
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
                    isValid: (value: string) => {
                        if (!String(value).trim()) {
                            throw new Error("description cannot be empty")
                        }
                    }
                }
            },
            creatorId: {
                type     : DataTypes.INTEGER,
                allowNull: false
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, {
            sequelize,
            modelName: "Project"
        });
    }
}
