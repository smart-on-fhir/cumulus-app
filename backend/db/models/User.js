const { DataTypes, Model } = require("sequelize");
const Bcrypt               = require("bcryptjs");
const moment               = require("moment");
const Activity             = require("./Activity");


/**
 * @param {string|null} pass 
 */
function validatePassword(pass) {
    if (!pass) {
        return true;
    }
    if (pass.length < 8) {
        throw new Error("Passwords must be at least 8 characters long");
    }
    if (!pass.match(/[A-Z]/)) {
        throw new Error("Passwords must contain at least one upper-case letter");
    }
    if (!pass.match(/[a-z]/)) {
        throw new Error("Passwords must contain at least one lower-case letter");
    }
    if (!pass.match(/[0-9]/)) {
        throw new Error("Passwords must contain at least one digit");
    }
    if (!pass.match(/(\$|@|,|#|!|%|~|&|\*|\^)/)) {
        throw new Error("Passwords must contain at least one special character (@,#,!,$,%,~,&,*,^)");
    }
}

module.exports = class User extends Model
{
    toString() {
        return `User "${this.get("name") || this.get("email")}"`;
    }

    /**
     * @param {import("sequelize").Sequelize} sequelize
     */
    static initialize(sequelize) {

        return User.init({

            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },

            // The email also acts as primary key
            email: {
                type     : DataTypes.STRING(100),
                allowNull: false,
                unique   : true,
                validate: {
                    isEmail: true
                }
            },

            // Display name (optional)
            name: {
                type     : DataTypes.STRING(100),
                allowNull: true
            },
            
            // Encrypted password (or empty string before activation)
            password: {
                type     : DataTypes.STRING(100),
                allowNull: true,
                set(pass) {
                    if (!pass) {
                        this.setDataValue("password", null)
                    } else {
                        validatePassword(pass + "")
                        this.setDataValue("password", Bcrypt.hashSync(pass, Bcrypt.genSaltSync(10)))
                    }
                },
                validate: {
                    isValidPassword: validatePassword
                }
            },
            
            // "user" or "admin"
            role: {
                type: DataTypes.ENUM('user', 'manager', 'admin'),
                allowNull: false,
                defaultValue: "user",
                validate: {
                    isIn: [['user', 'manager', 'admin']]
                }
            },
            
            // Session ID
            sid: {
                type: DataTypes.STRING,
                set(value) {
                    this.setDataValue('sid', value);
                    if (value) {
                        this.setDataValue('lastLogin', new Date());
                    }
                }
            },
            
            // Last login datetime (automatically updated on login)
            lastLogin: {
                type: DataTypes.DATE
            },

            status: {
                type: DataTypes.VIRTUAL,
                get() {
                    if (this.sid) {
                        return "Logged in";
                    }
                    if (this.password) {
                        return this.lastLogin ? "Not logged in" : "Never logged in";
                    }
                    if (moment().diff(moment(this.createdAt), "days") > 1) {
                        return "Expired invitation";
                    }
                    return "Pending invitation";
                }
            },

            // Random string
            activationCode: {
                type: DataTypes.STRING,
                unique: true
            },

            // The email of the user who invited this one
            invitedBy: {
                type: DataTypes.STRING,
                validate: {
                    isEmail: true
                }
            }
        }, {
            sequelize,
            modelName: "User",
            hooks: {
                async afterUpdate(model) {
                    if (model.changed("sid")) {
                        await Activity.create({
                            message: `${model} ${model.sid ? "logged in" : "logged out"}`,
                            tags: "auth"
                        })
                    }
                }
            }
        });
    };
}
