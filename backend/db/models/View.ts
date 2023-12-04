import BaseModel       from "./BaseModel"
import Tag             from "./Tag"
import Project         from "./Project"
import { CurrentUser } from "../../types"
import SystemUser      from "../../SystemUser"
import {
    CreationOptional,
    DataTypes,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
    Sequelize,
    Op
} from "sequelize"



export default class View extends BaseModel<InferAttributes<View>, InferCreationAttributes<View>>
{
    declare id              : CreationOptional<number>;
    declare name            : string;
    declare DataRequestId   : number;
    declare description     : CreationOptional<string | null>;
    declare screenShot      : CreationOptional<string | null>;
    declare settings        : CreationOptional<Record<string, any> | null>;
    declare creatorId       : CreationOptional<number | null>;
    declare createdAt       : CreationOptional<Date>;
    declare updatedAt       : CreationOptional<Date>;

    declare projects?: NonAttribute<Project[]>;

    declare setTags: HasManySetAssociationsMixin<Tag, number>;

    getPublicName() {
        return "Graphs"
    }

    isOwnedBy(user: CurrentUser) {
        return !!user && !!user.id && user.id === this.creatorId
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

            creatorId: DataTypes.INTEGER,
            
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, {
            sequelize,
            modelName: "View",
            scopes: {
                visible: function(user: CurrentUser) {
                    
                    // If the current user has permission to read any graph,
                    // then allow any graph
                    if (user.permissions["Graphs.read"]) {
                        return {}
                    }

                    // Otherwise pretend this is a system query so that the lack
                    // of "Graph.read" isn't stopping us, but then restrict to
                    // only seeing the graphs which have been explicitly shared
                    // with or created by the current user
                    return {
                        user: SystemUser,
                        where: {
                            [Op.or]: [
                                { creatorId: user.id },
                                { id: {
                                    [Op.in]: sequelize.literal(`(
                                        SELECT "resource_id"
                                          FROM "Permissions"
                                         WHERE "user_id" = ${+user.id}
                                           AND "resource" = 'Graphs'
                                           AND "action" = 'read'
                                           AND "permission" IS TRUE
                                    ) `)
                                }}
                            ]
                        }
                    }
                }
            }
        });
    }
}
