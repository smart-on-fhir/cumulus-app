import { Sequelize } from "sequelize"
import Activity      from "./Activity"
import DataRequest   from "./DataRequest"
import DataSite      from "./DataSite"
import Project       from "./Project"
import RequestGroup  from "./RequestGroup"
import Tag           from "./Tag"
import User          from "./User"
import View          from "./View"


export function init(connection: Sequelize) {
    User.initialize(connection);
    Tag.initialize(connection);
    Activity.initialize(connection);
    DataSite.initialize(connection);
    DataRequest.initialize(connection);
    Project.initialize(connection);
    RequestGroup.initialize(connection);
    View.initialize(connection);

    // graphs:subscriptions
    View.belongsTo(DataRequest, { foreignKey: "DataRequestId", targetKey: "id" });
    DataRequest.hasMany(View,   { foreignKey: "DataRequestId", onDelete: "CASCADE" });

    // subscription-groups:subscriptions
    DataRequest.belongsTo(RequestGroup, { as: "group", onDelete: "SET NULL" });
    RequestGroup.hasMany(DataRequest, { as: "requests", foreignKey: "groupId", onDelete: "SET NULL"});

    // users:tags
    User.hasMany(Tag,   { foreignKey: "creatorId" });
    Tag.belongsTo(User, { foreignKey: "creatorId", as: "creator", onDelete: "SET NULL" });

    // graphs:tags
    View.belongsToMany(Tag, { through: "ViewsTags", timestamps: false });
    Tag.belongsToMany(View, { through: "ViewsTags", timestamps: false, as: "graphs" });

    // subscriptions:tags
    DataRequest.belongsToMany(Tag, { through: "DataRequestsTags", timestamps: false });
    Tag.belongsToMany(DataRequest, { through: "DataRequestsTags", timestamps: false, as: "subscriptions" });
}
