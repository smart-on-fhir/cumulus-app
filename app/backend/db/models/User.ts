import Bcrypt     from "bcryptjs"
import moment     from "moment"
import { logger } from "../../logger"
import BaseModel  from "./BaseModel"
import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Sequelize
} from "sequelize"


function validatePassword(pass: string|null) {
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

export default class User extends BaseModel<InferAttributes<User>, InferCreationAttributes<User>>
{
    declare email         : string;
    declare role          : string;
    declare id            : CreationOptional<number>;
    declare name          : CreationOptional<string | null>;
    declare password      : CreationOptional<string | null>;
    declare sid           : CreationOptional<string | null>;
    declare lastLogin     : CreationOptional<Date>;
    declare activationCode: CreationOptional<string | null>;
    declare invitedBy     : CreationOptional<string | null>;
    declare status        : CreationOptional<string | null>;
    declare createdAt     : CreationOptional<Date>;
    declare updatedAt     : CreationOptional<Date>;

    toString() {
        return `User "${this.email}"`
    }

    isOwnedBy(user: User) {
        return user && user.id && user.id === this.id
    }

    static initialize(sequelize: Sequelize) {

        return User.init({

            id: {
                type         : DataTypes.INTEGER,
                allowNull    : false,
                primaryKey   : true,
                autoIncrement: true
            },

            email: {
                type     : DataTypes.STRING(100),
                allowNull: false,
                unique   : true,
                validate: {
                    isEmail: true
                }
            },

            name: {
                type     : DataTypes.STRING(100),
                allowNull: true
            },
            
            // Encrypted password (or empty string before activation)
            password: {
                type     : DataTypes.STRING(100),
                allowNull: true,
                set(pass: string) {
                    if (!pass) {
                        this.setDataValue("password", null)
                    } else {
                        validatePassword(pass + "")
                        this.setDataValue("password", Bcrypt.hashSync(pass, Bcrypt.genSaltSync(
                            process.env.NODE_ENV === "test" ? 1 : 10 // speed up tests
                        )))
                    }
                },
                validate: {
                    isValidPassword: validatePassword
                }
            },
            
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
                set(value: string | null) {
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
            },

            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, {
            sequelize,
            modelName: "User",
            hooks: {
                async afterUpdate(model) {
                    if (model.changed("sid")) {
                        logger.info(`${model} ${model.sid ? "logged in" : "logged out"}`, { tags: ["AUTH", "ACTIVITY"] })
                    }
                }
            }
        });
    };
}
