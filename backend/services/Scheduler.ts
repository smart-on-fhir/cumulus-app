import moment                    from "moment"
import { Op }                    from "sequelize"
import Subscription              from "../db/models/Subscription"
import * as logger               from "../services/logger"
import SystemUser                from "../SystemUser"
import { fetchSubscriptionData } from "../DataManager/CsvDownloader"


let timer: NodeJS.Timeout;
export async function runScheduler() {
    if (timer) {
        timer.refresh()
    } else {
        await synchronize()
        timer = setTimeout(runScheduler, 1000 * 60 * 60).unref()
    }
}

async function synchronize()
{
    /**
     * Get all Subscription models that should be updated (now or in the future)
     */
    const rows: any[] = await Subscription.findAll({
        order: [["completed", "desc"]],
        where: {
            [Op.and]: {
                refresh: {
                    [Op.ne]: "manually"
                },
                dataURL: {
                    [Op.not]: null
                }
            }
        },
        user: SystemUser
    });

    for (const row of rows) {

        // Determine when the next refresh should be
        const refreshAt = moment(row.completed || undefined)

        switch(row.refresh) {
            case "yearly":
                refreshAt.add(1, "year");
                break;
            case "monthly":
                refreshAt.add(1, "month");
                break;
            case "weekly": 
                refreshAt.add(1, "week");
                break;
            case "daily":
                refreshAt.add(1, "day");
                break;
            default:
                break;
        }

        // Check if it is time to refresh this model's data
        if (refreshAt.isSameOrBefore(moment(), "minute")) {
            logger.info(`Refreshing data for ${row}...`)
            try {
                await fetchSubscriptionData(row)
            } catch (error) {
                logger.error(`Error while trying to refresh data for ${row}: ${error}`)
            }
        }
    }
}
