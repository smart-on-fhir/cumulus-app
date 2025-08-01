import { Sequelize, Op } from "sequelize"
import * as logger       from "../../services/logger"
import BaseModel         from "./BaseModel"
import Subscription      from "./Subscription"
import StudyArea         from "./StudyArea"
import SubscriptionGroup from "./SubscriptionGroup"
import Tag               from "./Tag"
import User              from "./User"
import View              from "./View"
import Permission        from "./Permission"
import UserGroup         from "./UserGroup"
import SystemUser        from "../../SystemUser"
import { emit }          from "../../services/SSE"


export function attachHooks(connection: Sequelize) {

    // Request permission to update --------------------------------------------
    connection.addHook("beforeUpdate", function(model: BaseModel, options) {
        model.requestPermissionToUpdate(options)
    })

    // Request permission to create --------------------------------------------
    connection.addHook("beforeCreate", function(model: BaseModel, options) {
        model.requestPermissionToCreate(options)
    })

    // Request permission to read one record -----------------------------------
    connection.addHook("afterFind", function(model: BaseModel | BaseModel[], options) {
        const role = options.user?.role || "guest"
        if (role !== "system") {
            if (Array.isArray(model)) {
                model.forEach(m => {
                    // filter out runtime models from connecting tables
                    if (m && m instanceof BaseModel) {
                        m.requestPermissionToRead(options)
                    }
                })
            } else if (model && model instanceof BaseModel) {
                model.requestPermissionToRead(options)
            } else {
                // TODO: model might be null
            }
        }
    });

    // Request permission to delete --------------------------------------------
    connection.addHook('beforeDestroy', function(model: BaseModel, options) {
        model.requestPermissionToDelete(options)
    });

    // Log inserts -------------------------------------------------------------
    connection.addHook("afterCreate", function(model: BaseModel, options) {
        logger.info(`${model} created by ${options.user?.email || options.user?.role || "guest"}`)
        if (model instanceof Permission) {
            updateUsers()
        }
    })

    // Log updates -------------------------------------------------------------
    connection.addHook("afterUpdate", function(model: BaseModel, options) {
        logger.info(`${model} updated by ${options.user?.email || options.user?.role || "guest"}`)
        if (model instanceof Permission || model instanceof UserGroup) {
            updateUsers()
        }
    })

    // After delete ------------------------------------------------------------
    connection.addHook("afterDestroy", async function(model: BaseModel, options) {

        // Delete all permissions given for this type + id
        if (!(model instanceof Permission)) {
            await Permission.destroy({
                where: {
                    resource: model.getPublicName(),
                    resource_id: model.get("id")!
                }
            })
        } else {
            updateUsers()
        }
        
        // Delete all permissions given to this user
        if (model instanceof User) {
            await Permission.destroy({
                where: {
                    user_id: model.get("id")!
                }
            })    
        }

        // Delete all permissions given to this group
        else if (model instanceof UserGroup) {
            await Permission.destroy({
                where: {
                    user_group_id: model.get("id")!
                }
            })    
        }

        logger.info(`${model} deleted by ${options.user?.email || options.user?.role || "guest"}`)
    })

    connection.addHook("afterBulkDestroy", options => {
        // @ts-ignore
        const { model, user, where } = options
        logger.info('Multiple %s records (%o) deleted by %s', model.name, where, user?.email || user?.role || "guest")
        if (model === Permission) {
            updateUsers()
        }
    })


    // When to update user permissions -----------------------------------------
    async function updateUsers() {
        const onlineUsers = await User.findAll({
            where: {
                sid: { [Op.not]: null },
                role: { [Op.not]: "admin" }
            },
            user: SystemUser
        });
        for (const user of onlineUsers) {
            await updateUser(user);
        }
    }

    async function updateUser(user: User) {
        const permissions = await user.getPermissions(true);
        const json = {
            ...user.toJSON(),
            permissions: Object.keys(permissions).filter(k => !!permissions[k])
        }
        // @ts-ignore
        delete json.password
        // @ts-ignore
        delete json.sid
        emit({ type: "userSync", data: json }, user.id)
    }
    
    User.addHook("afterUpdate", (model, options) => {
        updateUser(model as User)
    })
}

export function init(connection: Sequelize) {
    User.initialize(connection);
    Tag.initialize(connection);
    Subscription.initialize(connection);
    StudyArea.initialize(connection);
    SubscriptionGroup.initialize(connection);
    View.initialize(connection);
    Permission.initialize(connection);
    UserGroup.initialize(connection);

    // The possible choices for onDelete and onUpdate are:
    // RESTRICT, CASCADE, NO ACTION, SET DEFAULT and SET NULL.

    
    // Graphs ------------------------------------------------------------------

    // Graphs have one subscription as View.Subscription
    View.belongsTo(Subscription, { foreignKey: "subscriptionId", targetKey: "id" });

    // Graphs have many tags as View.Tags
    View.belongsToMany(Tag, { through: "ViewsTags", timestamps: false });


    
    // Subscriptions -----------------------------------------------------------
    
    // Subscriptions have many graphs as Subscription.Views
    Subscription.hasMany(View, { foreignKey: "subscriptionId", constraints: true, hooks: true, onDelete: "CASCADE" });

    // Subscriptions belong to one SubscriptionGroup as Subscription.group
    Subscription.belongsTo(SubscriptionGroup, { as: "group", onDelete: "SET NULL" });

    // Subscriptions belong to many StudyAreas
    Subscription.belongsToMany(StudyArea, { through: "ProjectsSubscriptions", as: "StudyAreas", timestamps: false });

    // Subscriptions have many Tags
    Subscription.belongsToMany(Tag, { through: "DataRequestsTags", timestamps: false, foreignKey: "DataRequestId" });



    // SubscriptionGroups ------------------------------------------------------

    // SubscriptionGroup have many Subscriptions as requests
    SubscriptionGroup.hasMany(Subscription, { as: "requests", foreignKey: "groupId", onDelete: "SET DEFAULT" });



    // StudyAreas --------------------------------------------------------------

    // StudyArea has many Subscriptions
    StudyArea.belongsToMany(Subscription, { through: "ProjectsSubscriptions", as: "Subscriptions", timestamps: false, foreignKey: "ProjectId" });
    


    // Users -------------------------------------------------------------------
    
    // User has many tags
    User.hasMany(Tag, { foreignKey: "creatorId" });

    // User belongs to many UserGroups as groups
    User.belongsToMany(UserGroup, { through: "UserGroupUsers", timestamps: false, as: "groups" });

    

    // Tags --------------------------------------------------------------------

    // Tag has many Graphs as graphs
    Tag.belongsToMany(View, { through: "ViewsTags", timestamps: false, as: "graphs" });

    // Tag belongs to User as creator
    Tag.belongsTo(User, { foreignKey: "creatorId", as: "creator", onDelete: "SET NULL" });

    // belongs to many Subscriptions as subscriptions
    Tag.belongsToMany(Subscription, { through: "DataRequestsTags", timestamps: false, as: "subscriptions" });



    // UserGroups --------------------------------------------------------------
    
    // UserGroup has many Users as users
    UserGroup.belongsToMany(User, { through: "UserGroupUsers", timestamps: false, as: "users" });



    // Permissions -------------------------------------------------------------
    
    // Permission belongs to User (sometimes)
    Permission.belongsTo(User, { foreignKey: "user_id" });
    Permission.belongsTo(UserGroup, { foreignKey: "user_group_id" });
}
