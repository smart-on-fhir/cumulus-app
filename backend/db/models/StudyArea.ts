import BaseModel    from "./BaseModel"
import Subscription from "./Subscription"
import {
    Sequelize,
    DataTypes,
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Association,
    HasManySetAssociationsMixin
} from "sequelize"



export default class StudyArea extends BaseModel<InferAttributes<StudyArea>, InferCreationAttributes<StudyArea>>
{
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare creatorId?: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare setSubscriptions: HasManySetAssociationsMixin<Subscription, number>;

    declare static associations: {
        Subscriptions: Association<Subscription, StudyArea>;
    };

    public isOwnedBy(user: any): boolean {
        return user && user.id && user.id === this.creatorId;
    }

    getPublicName() {
        return "StudyAreas"
    }

    static initialize(sequelize: Sequelize) {
        StudyArea.init({
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
            modelName: "StudyArea",
            tableName: "Projects"
        });
    }
}
