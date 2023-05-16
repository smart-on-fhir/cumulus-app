import { CreateOptions, FindOptions, InstanceDestroyOptions, InstanceUpdateOptions } from "sequelize"
import { Sequelize, Model }  from "sequelize"
import { requestPermission } from "../../acl"


export default abstract class BaseModel<
    TModelAttributes extends {} = any,
    TCreationAttributes extends {} = TModelAttributes
> extends Model<
    TModelAttributes,
    TCreationAttributes
>
{
    static initialize(sequelize: Sequelize) {
        throw new Error(`Model ${this.name} did not implement the initialize method`)
    }

    public isOwnedBy(user: any): boolean {
        return false
    }

    public requestPermissionToRead(options?: FindOptions) {
        const user = this.sequelize.user
        const role = options?.__role__ || user.role
        if (role !== "system") {
            const attributes = this.get();
            Object.keys(attributes).forEach(attr => {
                requestPermission(role, `${(this.constructor as typeof BaseModel).tableName}.read.${attr}`, this.isOwnedBy(user))
            })
        }
    }

    requestPermissionToCreate(options?: CreateOptions) {
        const user = this.sequelize.user
        const role = options?.__role__ || user.role
        if (role !== "system") {
            requestPermission(role, `${(this.constructor as typeof BaseModel).tableName}.create`)
        }
    }

    requestPermissionToUpdate(options?: InstanceUpdateOptions) {
        const user = this.sequelize.user
        const role = options?.__role__ || user.role
        if (role !== "system") {
            const changed = this.changed()
            if (changed) {
                changed.forEach((column) => {
                    requestPermission(role, `${(this.constructor as typeof BaseModel).tableName}.update.${column}`, this.isOwnedBy(user))
                })
            } else {
                requestPermission(role, `${(this.constructor as typeof BaseModel).tableName}.update`, this.isOwnedBy(user))
            }
        }
    }

    requestPermissionToDelete(options?: InstanceDestroyOptions) {
        const user = this.sequelize.user
        const role = options?.__role__ || user.role
        if (role !== "system") {
            requestPermission(role, `${(this.constructor as typeof BaseModel).tableName}.delete`, this.isOwnedBy(user))
        }
    }

    toString() {
        let str = `${this.constructor.name} #${this.get("id")}`
        let name = this.get("name")
        if (name) {
            str += ` (${JSON.stringify(name)})`
        }
        return str
    }
}