import { sendDataRequest } from "../../services/email"
import * as logger         from "../../services/logger"
import { app }             from "../../types"
import BaseModel           from "./BaseModel"
import Tag                 from "./Tag"
import {
    CreationOptional,
    DataTypes,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Sequelize
} from "sequelize"


export default class Subscription extends BaseModel<InferAttributes<Subscription>, InferCreationAttributes<Subscription>>
{
    declare id           : CreationOptional<number>;
    declare name         : string;
    declare description  : CreationOptional<string | null>;
    declare refresh      : 'manually' | 'yearly' | 'monthly' | 'weekly' | 'daily';
    declare completed    : CreationOptional<Date | null>;
    declare requestedData: CreationOptional<Record<string, any> | null>;
    declare metadata     : CreationOptional<app.SubscriptionMetaData | null>;
    declare groupId      : CreationOptional<number | null>;
    declare dataURL      : CreationOptional<string | null>;
    declare transmissions: CreationOptional<Record<string, any> | null>;
    declare createdAt    : CreationOptional<Date>;
    declare updatedAt    : CreationOptional<Date>;
    
    declare setTags: HasManySetAssociationsMixin<Tag, number>;

    getPublicName() {
        return "Subscriptions"
    }

    static initialize(sequelize: Sequelize) {
        Subscription.init({
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
            
            groupId: {
                type: DataTypes.INTEGER
            },

            dataURL: {
                type: DataTypes.STRING(50_000)
            },

            transmissions: {
                type: DataTypes.JSONB,
                defaultValue: null
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
            modelName: "Subscription",
            tableName: "DataRequests",
            hooks: {
                async afterCreate(model) {
                    // Note that we don't wait for this to complete
                    sendDataRequest(model.toJSON() as any).catch(error => {
                        logger.error("Failed sending data request: " + error, error)
                    });
                }
            }
        });
    }
};
