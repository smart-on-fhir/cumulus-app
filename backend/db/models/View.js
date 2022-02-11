const { DataTypes, Model }  = require("sequelize")
const { unlink, writeFile } = require("fs").promises
const Path                  = require("path");

const SCREENSHOT_DIR = Path.join(__dirname, "/../../screenShots/")


class View extends Model
{
    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static associate(sequelize) {
        sequelize.models.View.belongsTo(sequelize.models.DataRequest)
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        View.init({
            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },
            
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            
            description: {
                type: DataTypes.STRING(500)
            },
            
            dataSourceId: {
                type: DataTypes.INTEGER
            },
            
            screenShot: {
                type: DataTypes.STRING
            },

            settings: {
                type: DataTypes.JSON
            }
        }, {
            sequelize,
            modelName: "View",
            hooks: {

                /**
                 * When new View is created, if a screenShot is present (should
                 * be a DataURL string) generate an image file and update the
                 * record so that "screenShot" is the file name.
                 * @param {View} instance 
                 */
                async afterCreate(instance) {
                    await updateScreenshot(instance)
                    await instance.save({ hooks: false })
                },
                
                /**
                 * When new View is updated, if a screenShot is present (should
                 * be a DataURL string) generate an image file and update the
                 * record so that "screenShot" is the file name. If "screenShot"
                 * is empty delete the file and set "screenShot" to null.
                 * @param {View} instance 
                 */
                async beforeUpdate(instance) {
                    await updateScreenshot(instance)
                },

                /**
                 * When a View is deleted, if it has a screenShot delete its
                 * corresponding image file.
                 * @param {View} instance 
                 */
                async afterDestroy(instance) {
                    const newValue = String(instance.get("screenShot") || "")
                    if (newValue) {
                        await deleteScreenShot(newValue)
                    }
                }
            }
        });
    }
}


/**
 * Delete a screenshot file
 * @param {string} fileName
 */
async function deleteScreenShot(fileName) {
    return unlink(Path.join(SCREENSHOT_DIR, fileName));
}

/**
 * Write a screenshot file
 * @param {string} id
 * @param {string} data
 */
async function writeScreenShot(id, data) {
    const matches = data.match(/^data:.+\/(.+);base64,(.*)$/);

    if (matches) {
        const ext      = matches[1];
        const data     = matches[2];
        const buffer   = Buffer.from(data, "base64");
        const fileName = id + "." + ext;
        const filePath = Path.join(SCREENSHOT_DIR, fileName);
        await writeFile(filePath, buffer);
        return fileName
    }

    return ""
}

/**
 * When new View is created, if a screenShot is present (should
 * be a DataURL string) generate an image file and update the
 * record so that "screenShot" is the file name.
 * @param {View} instance 
 */
async function updateScreenshot(instance) {
    const oldValue = String(instance.previous("screenShot") || "");
    const newValue = String(instance.get("screenShot") || "");
    const id       = String(instance.get("id") || "");

    if (oldValue !== newValue) {
        
        // Remove image
        if (!newValue) {
            await deleteScreenShot(oldValue)
            instance.set("screenShot", null)
        }

        // Add or Update an image
        else {
            const fileName = await writeScreenShot(id, newValue)
            instance.set("screenShot", fileName || null)
        }
    }
}

module.exports = View;
