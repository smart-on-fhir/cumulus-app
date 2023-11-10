import { Forbidden, Unauthorized } from "./errors";
import { buildPermissionId } from "./lib";


export function requestPermission({ user = {}, resource, attribute, action }: {
    user     ?: { role?: string; id?: number; permissions?: Record<string, boolean>; [key: string]: any; }
    resource  : any // (string | BaseModel) but can't import BaseModel due to circular dependency
    action    : string
    attribute?: string
})
{
    const { role = "guest", id = -1, permissions = {} } = user

    if (role === "system" || role === "owner") return true

    const isOwner      = typeof resource === "string" ? false    : resource.isOwnedBy(user)

    if (isOwner) return true

    const resourceName = typeof resource === "string" ? resource : resource.getPublicName()
    const resource_id  = typeof resource === "string" ? null     : resource.get("id") as number
    const tried: string[] = [];

    const msgPrefix = role === "guest" ? "Guest" : `User ${id > 0 ? `#${id} ` : ""}having role of "${role}"`;
    
    function throwError(msg?: string) {
        msg = msg || msgPrefix + ` was rejected the following permission: "${perm}"`;
        const data = {
            message: `Permission denied`,
            tags   : ["AUTH"],
            reason : msg,
            owner  : isOwner
        };
        throw role === "guest" ? new Unauthorized(msg!, data) : new Forbidden(msg!, data);
    }

    // Resource#id.attribute.action --------------------------------------------
    if (resource_id && attribute) {
        const perm = buildPermissionId({ resource: resourceName, action, attribute, resource_id })
        if (permissions[perm] === false) {
            throwError()
        }
        else if (permissions[perm] === true) {
            return true
        }
        tried.push(perm)
    }

    // Resource#id.action ------------------------------------------------------
    if (resource_id) {
        const perm = buildPermissionId({ resource: resourceName, action, resource_id })
        if (permissions[perm] === false) {
            throwError()
        }
        else if (permissions[perm] === true) {
            return true
        }
        tried.push(perm)
    }

    // Resource.attribute.action -----------------------------------------------
    if (attribute) {
        const perm = buildPermissionId({ resource: resourceName, action, attribute })
        if (permissions[perm] === false) {
            throwError()
        }
        else if (permissions[perm] === true) {
            return true
        }
        tried.push(perm)
    }

    // Resource.action ---------------------------------------------------------
    const perm = buildPermissionId({ resource: resourceName, action });
    if (permissions[perm] === false) {
        throwError()
    }
    else if (permissions[perm] === true) {
        return true
    }
    tried.push(perm)


    // No permissions found ----------------------------------------------------
    throwError(`${msgPrefix} needs at least one of the following permissions: "${tried.join('", "')}".`);
}
