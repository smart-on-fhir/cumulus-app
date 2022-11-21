const { DataTypes, Model } = require("sequelize");
// const Activity = require("./Activity");

module.exports = class RequestGroup extends Model
{
    toString() {
        return `RequestGroup #${this.get("id")} "${this.get("name")}"`;
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        RequestGroup.init({
            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.STRING
            }
        }, {
            sequelize,
            modelName: "RequestGroup",
            hooks: {
                // async afterCreate(model, { user }) {
                //     await Activity.create({
                //         message: `${model} created by ${user ? user.name || "user #" + user.id : "system"}`,
                //         tags   : "requests"
                //     })
                // }
            }
        });
    };

}