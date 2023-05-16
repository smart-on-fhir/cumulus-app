import moment        from "moment"
import { Op }        from "sequelize"
import Activity      from "./db/models/Activity"
import DataRequest   from "./db/models/DataRequest"
import { fetchData } from "./controllers/DataRequest"


async function run() {
    await synchronize()
    setTimeout(run, 1000 * 60 * 60).unref()
}


async function synchronize()
{
    /**
     * Get all DataRequest models that should be updated (now or in the future)
     * @type {any[]}
     */
    const rows = await DataRequest.findAll({
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
        }
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

            await Activity.create({
                message: `Refreshing data for ${row}...`,
                tags   : "requests"
            });

            try {
                const data = await fetchData(row)
                await row.set({
                    data,
                    completed: new Date()
                }).save();
            } catch (error) {
                await Activity.create({
                    message: `Error while trying to refresh data for ${row}: ${error}`,
                    tags   : "requests"
                });
            }
        }
    }
}

run();
