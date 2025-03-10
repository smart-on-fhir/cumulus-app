import { Sequelize }      from "sequelize"
import Users              from "./Users"
import StudyAreas         from "./StudyAreas"
import SubscriptionGroups from "./SubscriptionGroups"
import Subscriptions      from "./Subscriptions"
import Views              from "./Views"
import Permissions        from "./permissions"
import UserGroups         from "./UserGroups"
import Tags               from "./Tags"
import { seedTable }      from "../lib"


export async function seed(connection: Sequelize) {
    await seedTable(connection, "User"             , Users              )
    await seedTable(connection, "StudyArea"        , StudyAreas         )
    await seedTable(connection, "SubscriptionGroup", SubscriptionGroups )
    await seedTable(connection, "Subscription"     , Subscriptions      )
    await seedTable(connection, "View"             , Views              )
    await seedTable(connection, "UserGroup"        , UserGroups         )
    await seedTable(connection, "Permission"       , Permissions        )
    await seedTable(connection, "Tag"              , Tags               )
}
