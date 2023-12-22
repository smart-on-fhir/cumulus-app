import { CreateOptions, FindOptions, InstanceDestroyOptions, InstanceUpdateOptions } from "sequelize"
import { Sequelize, Model }  from "sequelize"
import { requestPermission } from "../../services/acl"


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

    public getPublicName() {
        return (this.constructor as typeof BaseModel).tableName
    }

    public isOwnedBy(user: any): boolean {
        return false
    }

    public requestPermissionToRead(options?: FindOptions) {
        const role = options?.user?.role || "guest"
        if (role !== "system") {
            const attributes = this.get();
            for (const attr of Object.keys(attributes)) {
                requestPermission({
                    user: options?.user as any,
                    resource: this,
                    action: "read",
                    attribute: attr
                })
            }
        }
    }

    public requestPermissionToCreate(options?: CreateOptions) {
        const role = options?.user?.role || "guest"
        if (role !== "system") {
            requestPermission({
                user: options?.user as any,
                resource: this.getPublicName(),
                action: "create"
            })
        }
    }

    public requestPermissionToUpdate(options?: InstanceUpdateOptions) {
        const role = options?.user?.role || "guest"
        if (role !== "system") {
            const changed = this.changed()
            if (changed) {
                for (const attribute of changed) {
                    requestPermission({
                        user: options?.user as any,
                        resource: this,
                        action: "update",
                        attribute
                    })
                }
            } else {
                requestPermission({
                    user: options?.user as any,
                    resource: this,
                    action: "update"
                })
            }
        }
    }

    public requestPermissionToDelete(options?: InstanceDestroyOptions) {
        const role = options?.user?.role || "guest"
        if (role !== "system") {
            requestPermission({
                user: options?.user as any,
                resource: this,
                action: "delete"
            })
        }
    }

    public toString() {
        let str = `${this.constructor.name} #${this.get("id")}`
        let name = this.get("name")
        if (name) {
            str += ` (${JSON.stringify(name)})`
        }
        return str
    }
}