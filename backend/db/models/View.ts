import BaseModel     from "./BaseModel"
import {
    CreationOptional,
    DataTypes,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
    Sequelize
} from "sequelize"
import Tag from "./Tag";
import Project from "./Project";


export default class View extends BaseModel<InferAttributes<View>, InferCreationAttributes<View>>
{
    declare id              : CreationOptional<number>;
    declare name            : string;
    declare DataRequestId   : number;
    declare description     : CreationOptional<string | null>;
    declare screenShot      : CreationOptional<string | null>;
    declare settings        : CreationOptional<Record<string, any> | null>;
    declare createdAt       : CreationOptional<Date>;
    declare updatedAt       : CreationOptional<Date>;

    declare projects?: NonAttribute<Project[]>;

    declare setTags: HasManySetAssociationsMixin<Tag, number>;

    getPublicName() {
        return "Graphs"
    }

    static initialize(sequelize: Sequelize) {
        View.init({
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
            
            screenShot: {
                type: DataTypes.TEXT,
                get() {
                    const screenShot = this.getDataValue("screenShot") || "";
                    const match = (/^data:image\/(.+?);base64,(.+)$/).exec(screenShot);

                    if (!match || match.length < 3) {
                        return null
                    }

                    return `/api/views/${this.id}/screenshot.${match[1]}`
                }
            },

            settings: {
                type: DataTypes.JSONB
            },

            DataRequestId: DataTypes.INTEGER,
            
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, {
            sequelize,
            modelName: "View"
        });
    }
}
