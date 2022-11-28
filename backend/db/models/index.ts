import { Sequelize } from "sequelize"
import { logger }    from "../../logger"
import Activity      from "./Activity"
import BaseModel     from "./BaseModel"
import DataRequest   from "./DataRequest"
import DataSite      from "./DataSite"
import Project       from "./Project"
import RequestGroup  from "./RequestGroup"
import Tag           from "./Tag"
import User          from "./User"
import View          from "./View"

export function attachHooks(connection: Sequelize) {

    // Request permission to update --------------------------------------------
    connection.addHook("beforeUpdate", function(model: BaseModel, options) {
        model.requestPermissionToUpdate(options)
    })

    // Log updates -------------------------------------------------------------
    connection.addHook("afterUpdate", function(model: BaseModel, options) {
        if ((model.constructor as typeof BaseModel).tableName !== "Activity") {
            // @ts-ignore
            const role = options.__role__ || connection.user?.role || "guest"
            logger.info(`${model} updated by ${connection.user?.email || role}`, { tags: ["ACTIVITY"] })
        }
    })

    // Request permission to create --------------------------------------------
    connection.addHook("beforeCreate", function(model: BaseModel, options) {
        model.requestPermissionToCreate(options)
    })

    // Log inserts -------------------------------------------------------------
    connection.addHook("afterCreate", function(model: BaseModel, options) {
        if ((model.constructor as typeof BaseModel).tableName !== "Activity") {
            // @ts-ignore
            const role = options.__role__ || connection.user?.role || "guest"
            logger.info(`${model} created by ${connection.user?.email || role}`, { tags: ["ACTIVITY"] })
        }
    })

    // Request permission to read one record -----------------------------------
    connection.addHook("afterFind", function(model: BaseModel | BaseModel[], options) {
        const role = options.__role__ || connection.user?.role || "guest"
        if (role !== "system") {
            if (Array.isArray(model)) {
                model.forEach(m => m.requestPermissionToRead(options))
            } else if (model) {
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

    // Log deletes -------------------------------------------------------------
    connection.addHook("afterDestroy", function(model: BaseModel, options) {
        if ((model.constructor as typeof BaseModel).tableName !== "Activity") {
            // @ts-ignore
            const role = options.__role__ || connection.user?.role || "guest"
            logger.info(`${model} deleted by ${connection.user?.email || role}`, { tags: ["ACTIVITY"] })
        }
    })
}

export function init(connection: Sequelize) {
    User.initialize(connection);
    Tag.initialize(connection);
    Activity.initialize(connection);
    DataSite.initialize(connection);
    DataRequest.initialize(connection);
    Project.initialize(connection);
    RequestGroup.initialize(connection);
    View.initialize(connection);

    // The possible choices for onDelete and onUpdate are:
    // RESTRICT, CASCADE, NO ACTION, SET DEFAULT and SET NULL.

    // graphs :: subscriptions -------------------------------------------------
    
    // Graphs have one subscription as View.DataRequest
    View.belongsTo(DataRequest, { foreignKey: "DataRequestId", targetKey: "id" });
    
    // Subscriptions have many graphs as DataRequest.Views. 
    // When a subscription is deleted all its graphs are also deleted!
    DataRequest.hasMany(View, { foreignKey: "DataRequestId", onDelete: "CASCADE" });



    // subscription-groups :: subscriptions ------------------------------------

    // Subscriptions have one RequestGroup as DataRequest.group
    DataRequest.belongsTo(RequestGroup, { as: "group", onDelete: "SET NULL" });

    // RequestGroups have many Subscriptions as RequestGroup.requests. 
    // When a RequestGroups is deleted all its Subscriptions are moved to the
    // default group (which might also be none)
    RequestGroup.hasMany(DataRequest, { as: "requests", foreignKey: "groupId", onDelete: "SET DEFAULT"});



    // users :: tags -----------------------------------------------------------
    User.hasMany(Tag,   { foreignKey: "creatorId" });
    Tag.belongsTo(User, { foreignKey: "creatorId", as: "creator", onDelete: "SET NULL" });

    // graphs:tags
    View.belongsToMany(Tag, { through: "ViewsTags", timestamps: false });
    Tag.belongsToMany(View, { through: "ViewsTags", timestamps: false, as: "graphs" });

    // subscriptions:tags
    DataRequest.belongsToMany(Tag, { through: "DataRequestsTags", timestamps: false });
    Tag.belongsToMany(DataRequest, { through: "DataRequestsTags", timestamps: false, as: "subscriptions" });
}
