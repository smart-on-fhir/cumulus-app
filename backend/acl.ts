import { NextFunction } from "express";
import { AppRequest, AppRequestHandler, Role } from ".";
import { Forbidden, Unauthorized } from "./errors";


type Action = "create" | "read" | "update" | "delete" | "*" | string 

interface Permissions {
    [action: Action]: boolean | Permissions
}

interface Acl {
    [subject: string]: Partial<Record<Role, boolean | Permissions>>
}

export const ACL: Acl = {
    Activities: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : { read: true }
    },
    RequestGroups: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : { read: true }
    },
    Views: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : {
            read: true,
            owner: true
        }
    },
    DataRequests: {
        admin  : { read: true, create: true, update: true, delete: true, export: true, requestLineLevelData: true, refresh: true },
        manager: { read: true, create: true, update: true, delete: true, export: true, requestLineLevelData: true, refresh: true },
        user   : { read: true, requestLineLevelData: true, refresh: true }
    },
    DataSites: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true },
        user   : { read: true }
    },
    Projects: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : { read: true }
    },
    Users: {
        admin  : { read: true, create: true, update: true, delete: true, invite: true },
        owner  : { read: true, update: true }
    },
    Tags: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : { read: true }
    },
    DataRequestsTags: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true },
        user   : { read: true }
    },
    ViewsTags: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : { read: true }
    },
    ProjectsSubscriptions: {
        admin  : { read: true, create: true, update: true, delete: true },
        manager: { read: true, create: true, update: true, delete: true },
        user   : { read: true }
    },
    Logs: {
        admin: { read: true }
    }
}

Object.freeze(ACL)

export function getPermissionsForRole(role: "admin"|"manager"|"user"|"guest"): string[] {
    const permissions: string[] = [];
    for (const s in ACL) {
        if (role in ACL[s]) {
            const x = ACL[s][role]
            if (x === false) {
                continue;
            }
            else if (x === true) {
                permissions.push(s);
            }
            else {
                for (const a in x) {
                    if (x[a]) {
                        permissions.push(s + "." + a);
                    }
                }
            }
        }
    }
    return permissions;
}

/**
 * @param role
 * @param path `"subject.action[.path...]"`
 */
export function requestPermission(role: Role, path: string, isOwner?: boolean)
{
    let allowed = hasPermission(role, path)
    let msg: string;
    
    if (!allowed) {
        msg = `User with role "${role}" has no ${path} permission`;
        if (role !== "owner" && isOwner) {
            allowed = hasPermission("owner", path)
            if (!allowed) {
                msg = `User with role "${role}|owner" has no ${path} permission`;
            }
        }
    }

    if (!allowed) {

        const data = {
            message: `Permission denied`,
            tags   : ["AUTH"],
            reason : `Permission denied for "${role}" to perform "${path}" action!`,
            owner  : isOwner
        };

        throw role === "guest" ? new Unauthorized(msg!, data) : new Forbidden(msg!, data);
    }
}

/**
 * @param role
 * @param path `"subject.action[.path...]"`
 */
export function hasPermission(role: Role, path: string) {
    const [ subject, ...rest ] = path.split(".");
    return [ role, ...rest  ].reduce((prev: any, cur) => {
        return prev && prev !== true ? prev[cur] : prev
    }, ACL[subject as keyof typeof ACL]) === true
}

export function requirePermissionMiddleware(permission: string, isOwner?: (req: AppRequest) => boolean): AppRequestHandler {
    return (req: AppRequest, res: any, next: NextFunction) => {
        requestPermission(req.user?.role || "guest", permission, isOwner && isOwner(req)) 
        next()
    }
}