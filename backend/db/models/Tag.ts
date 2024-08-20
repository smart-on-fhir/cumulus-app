import {
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    HasManyGetAssociationsMixin,
    Sequelize,
    DataTypes
} from "sequelize"
import { ModelDestroyOptions } from "../../types"
import BaseModel               from "./BaseModel"
import Subscription             from "./Subscription"
import View                    from "./View"




export default class Tag extends BaseModel<InferAttributes<Tag>, InferCreationAttributes<Tag>>
{
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare creatorId?: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare getGraphs: HasManyGetAssociationsMixin<View>; // Note the null assertions!
    declare getSubscriptions: HasManyGetAssociationsMixin<Subscription>;
    declare destroy: (options?: ModelDestroyOptions) => Promise<void>;

    public isOwnedBy(user: any): boolean {
        return user && user.id === this.creatorId
    }

    static initialize(sequelize: Sequelize) {
        return Tag.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: new DataTypes.STRING(50),
                    allowNull: false
                },
                description: {
                    type: new DataTypes.STRING(200),
                    allowNull: false
                },
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'Tags'
            }
        )
    }
}

