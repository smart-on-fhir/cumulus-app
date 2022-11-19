import User from "./User"
import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    // HasManyGetAssociationsMixin,
    // HasManyAddAssociationMixin,
    // HasManyAddAssociationsMixin,
    // HasManySetAssociationsMixin,
    // HasManyRemoveAssociationMixin,
    // HasManyRemoveAssociationsMixin,
    // HasManyHasAssociationMixin,
    // HasManyHasAssociationsMixin,
    // HasManyCountAssociationsMixin,
    // HasManyCreateAssociationMixin,
    // NonAttribute,
    Association,
    Sequelize,
    DataTypes,
    BelongsToGetAssociationMixin
} from "sequelize"
import { ModelDestroyOptions } from "../..";
// import { hasPermission, requestPermission } from "../../controllers/Auth";




class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>>
{
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare creatorId?: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    // declare getProjects: HasManyGetAssociationsMixin<Tag>; // Note the null assertions!
    // declare addProject: HasManyAddAssociationMixin<Tag, number>;
    // declare addProjects: HasManyAddAssociationsMixin<Tag, number>;
    // declare setProjects: HasManySetAssociationsMixin<Tag, number>;
    // declare removeProject: HasManyRemoveAssociationMixin<Tag, number>;
    // declare removeProjects: HasManyRemoveAssociationsMixin<Tag, number>;
    // declare hasProject: HasManyHasAssociationMixin<Tag, number>;
    // declare hasProjects: HasManyHasAssociationsMixin<Tag, number>;
    // declare countProjects: HasManyCountAssociationsMixin;
    // declare createProject: HasManyCreateAssociationMixin<Tag, 'creatorId'>;
    declare getCreator: BelongsToGetAssociationMixin<User>

    declare destroy: (options?: ModelDestroyOptions) => Promise<void>;

    // You can also pre-declare possible inclusions, these will only be
    // populated if you actively include a relation.
    // declare tags?: NonAttribute<Tag[]>; // Note this is optional since it's only populated when explicitly requested in code
    // declare creator?: User|null; 

    // getters that are not attributes should be tagged using NonAttribute
    // to remove them from the model's Attribute Typings.
    // get fullName(): NonAttribute<string> {
    //     return this.name;
    // }

    declare static associations: {
        owner: Association<Tag, User>;
    };

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
                creatorId: DataTypes.INTEGER,
                createdAt: DataTypes.DATE,
                updatedAt: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'Tags',
                // hooks: {
                //     beforeUpdate: async(model, options) => {
                //         hasPermission("tags_update", options.)
                //     }
                // }
            }
        )
    }

    static associate(sequelize: Sequelize) {
        Tag.belongsTo(User, {
            as: "creator",
            foreignKey: "creatorId",
            onDelete: "SET NULL"
        })
    }
}

// @ts-ignore
export = Tag
