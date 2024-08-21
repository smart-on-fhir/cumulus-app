import { Sequelize }        from "sequelize"
import { fixAutoIncrement } from "../backend/lib"
import Users                from "./fixtures/Users"
import DataSites            from "./fixtures/DataSites"
import StudyAreas           from "./fixtures/StudyAreas"
import SubscriptionGroups   from "./fixtures/SubscriptionGroups"
import Subscriptions        from "./fixtures/Subscriptions"
import Views                from "./fixtures/Views"
import Permissions          from "./fixtures/Permissions"
import UserGroups           from "./fixtures/UserGroups"


export async function seed(connection: Sequelize) {

    const { models } = connection

    await models.User.bulkCreate(Users);
    await fixAutoIncrement(connection, models.User.tableName, "id");

    await models.DataSite.bulkCreate(DataSites);
    await fixAutoIncrement(connection, models.DataSite.tableName, "id");

    await models.StudyArea.bulkCreate(StudyAreas);
    await fixAutoIncrement(connection, models.StudyArea.tableName, "id");

    await models.SubscriptionGroup.bulkCreate(SubscriptionGroups);
    await fixAutoIncrement(connection, models.SubscriptionGroup.tableName, "id");

    await models.Subscription.bulkCreate(Subscriptions);
    await fixAutoIncrement(connection, models.Subscription.tableName, "id");
    
    await models.View.bulkCreate(Views);
    await fixAutoIncrement(connection, models.View.tableName, "id");

    await models.Permission.bulkCreate(Permissions);
    await fixAutoIncrement(connection, models.Permission.tableName, "id");

    await models.UserGroup.bulkCreate(UserGroups);
    await fixAutoIncrement(connection, models.UserGroup.tableName, "id");

}
