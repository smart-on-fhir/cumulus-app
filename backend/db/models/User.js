const { DataTypes, Model } = require("sequelize");

module.exports = class User extends Model
{

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {
        return User.init({
            username: {
                type: DataTypes.STRING(100),
                primaryKey : true,
                allowNull: false,
                unique: true
            },
            
            password: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            
            role: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "user"
            },
            
            sid: {
                type: DataTypes.STRING
            },
            
            last_login: {
                type: DataTypes.DATE
            }
        }, {
            sequelize,
            modelName: "User"
        });
    };
}
