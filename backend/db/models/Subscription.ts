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
            description: DataTypes.TEXT,
            completed  : DataTypes.DATE,
            metadata   : DataTypes.JSONB,
            groupId    : DataTypes.INTEGER,
            dataURL    : DataTypes.STRING(50_000),
            createdAt  : DataTypes.DATE,
            updatedAt  : DataTypes.DATE,

            // DEPRECATED
            // -----------------------------------------------------------------
            requestedData: {
                type: DataTypes.JSONB
            },
            transmissions: {
                type: DataTypes.JSONB,
                defaultValue: null
            },
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
