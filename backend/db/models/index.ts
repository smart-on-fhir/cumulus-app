import { Sequelize } from "sequelize"
import { logger }    from "../../logger"
import BaseModel     from "./BaseModel"
import DataRequest   from "./DataRequest"
import DataSite      from "./DataSite"
import Project       from "./Project"
import RequestGroup  from "./RequestGroup"
import Tag           from "./Tag"
import User          from "./User"
import View          from "./View"
import Permission    from "./Permission"

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
        logger.info(`${model} created by ${options.user?.email || options.user?.role || "guest"}`, { tags: ["ACTIVITY"] })
    })

    // Log updates -------------------------------------------------------------
    connection.addHook("afterUpdate", function(model: BaseModel, options) {
        logger.info(`${model} updated by ${options.user?.email || options.user?.role || "guest"}`, { tags: ["ACTIVITY"] })
    })

    // Log deletes -------------------------------------------------------------
    connection.addHook("afterDestroy", function(model: BaseModel, options) {
        logger.info(`${model} deleted by ${options.user?.email || options.user?.role || "guest"}`, { tags: ["ACTIVITY"] })
    })
}

export function init(connection: Sequelize) {
    User.initialize(connection);
    Tag.initialize(connection);
    DataSite.initialize(connection);
    DataRequest.initialize(connection);
    Project.initialize(connection);
    RequestGroup.initialize(connection);
    View.initialize(connection);
    Permission.initialize(connection);

    // The possible choices for onDelete and onUpdate are:
    // RESTRICT, CASCADE, NO ACTION, SET DEFAULT and SET NULL.

    
    // Graphs ------------------------------------------------------------------

    // Graphs have one subscription as View.DataRequest
    View.belongsTo(DataRequest, { foreignKey: "DataRequestId", targetKey: "id" });

    // Graphs have many tags as View.DataRequest
    View.belongsToMany(Tag, { through: "ViewsTags", timestamps: false });


    
    // Subscriptions -----------------------------------------------------------
    
    // Subscriptions have many graphs as DataRequest.Views
    DataRequest.hasMany(View, { foreignKey: "DataRequestId", constraints: true, hooks: true, onDelete: "CASCADE" });

    // Subscriptions belong to one RequestGroup as DataRequest.group
    DataRequest.belongsTo(RequestGroup, { as: "group", onDelete: "SET NULL" });

    // Subscriptions belong to many StudyAreas as Projects
    DataRequest.belongsToMany(Project, { through: "ProjectsSubscriptions", as: "Projects", timestamps: false });

    // Subscriptions have many Tags
    DataRequest.belongsToMany(Tag, { through: "DataRequestsTags", timestamps: false });


    // SubscriptionGroups ------------------------------------------------------

    // SubscriptionGroup have many Subscriptions as requests
    RequestGroup.hasMany(DataRequest, { as: "requests", foreignKey: "groupId", onDelete: "SET DEFAULT" });


    // StudyAreas --------------------------------------------------------------

    // StudyArea has many Subscriptions
    Project.belongsToMany(DataRequest, { through: "ProjectsSubscriptions", as: "Subscriptions", timestamps: false });
    

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
    Tag.belongsToMany(DataRequest, { through: "DataRequestsTags", timestamps: false, as: "subscriptions" });


    // -------------------------------------------------------------------------
    //                           subscriptions :: tags
    // -------------------------------------------------------------------------
    DataRequest.belongsToMany(Tag, {
        through: "DataRequestsTags",
        timestamps: false
    });
    Tag.belongsToMany(DataRequest, {
        through: "DataRequestsTags",
        timestamps: false,
        as: "subscriptions"
    });
}
