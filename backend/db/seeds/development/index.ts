import { Sequelize }       from "sequelize"
import users               from "./users"
import study_areas         from "./study_areas"
import subscription_groups from "./subscription_groups"
import data_requests       from "./data_requests"
import views               from "./views"
import tags                from "./tags"
import subscriptionsTags   from "./data_requests_tags"
import viewsTags           from "./views_tags"
import permissions         from "./permissions"
import { seedTable }       from "../lib"


export async function seed(connection: Sequelize) {
    await seedTable(connection, "User"             , users              )
    await seedTable(connection, "StudyArea"        , study_areas        )
    await seedTable(connection, "SubscriptionGroup", subscription_groups)
    await seedTable(connection, "Subscription"     , data_requests      )
    await seedTable(connection, "View"             , views              )
    await seedTable(connection, "Tag"              , tags               )
    await seedTable(connection, "Permission"       , permissions        )

    await connection.models.DataRequestsTags.bulkCreate(subscriptionsTags, { ignoreDuplicates: true })
    await connection.models.ViewsTags.bulkCreate(viewsTags, { ignoreDuplicates: true })
}
