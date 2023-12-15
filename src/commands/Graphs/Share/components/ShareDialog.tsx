import { useEffect, useState } from "react"
import { request }             from "../../../../backend"
import { AlertError }          from "../../../../components/generic/Alert"
import Dialog                  from "../../../../components/generic/Dialog"
import Grid                    from "../../../../components/generic/Grid"
import Loader                  from "../../../../components/generic/Loader"
import { app }                 from "../../../../types"
import ActionsList             from "./ActionsList"
import EmailSelector           from "./EmailSelector"
import RoleList                from "./RoleList"
import UserGroupList           from "./UserGroupList"


export default function ShareDialog({
    user = null,
    resource,
    resource_id,
    dialogTitle = "Crete or Update Permissions"
}: {
    user?: app.User | null
    resource: string
    resource_id?: number[]
    dialogTitle?: string
})
{
    const canReadUsers      = !!user?.permissions.includes("Users.read");
    const canReadUserGroups = !!user?.permissions.includes("UserGroups.read");

    const [loadingUserEmails     , setLoadingUserEmails     ] = useState<boolean>(false);
    const [loadingUserGroups     , setLoadingUserGroups     ] = useState<boolean>(false);
    const [loadingActions        , setLoadingActions        ] = useState<boolean>(false);
    const [submitting            , setSubmitting            ] = useState<boolean>(false);
    const [userEmails            , setUserEmails            ] = useState<string[]>([]);
    const [userGroups            , setUserGroups            ] = useState<app.UserGroup[]>([]);
    const [message               , setMessage               ] = useState<string>("");
    const [loadingUserEmailsError, setLoadingUserEmailsError] = useState<Error|null>(null);
    const [loadingUserGroupsError, setLoadingUserGroupsError] = useState<Error|null>(null);
    const [loadingActionsError   , setLoadingActionsError   ] = useState<Error|null>(null);
    const [error                 , setError                 ] = useState<Error|null>(null);
    const [validationError       , setValidationError       ] = useState<string>("")
    const [shareWith             , setShareWith             ] = useState<"users" | "groups" | "roles">("users")
    const [selectedGroups        , setSelectedGroups        ] = useState<number[]>([])
    const [selectedEmails        , setSelectedEmails        ] = useState<string[]>([])
    const [selectedActions       , setSelectedActions       ] = useState<Record<string, { selected: boolean }>>({
        read  : { selected: true  },
        update: { selected: false },
        delete: { selected: false },
        share : { selected: false }
    })
    const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({
        manager: false,
        user   : false,
        guest  : false
    })


    const submit = (close: () => void) => {
        const error = getValidationError()
        if (error) {
            return setValidationError(error)
        }
        
        setValidationError("")

        // ---------------------------------------------------------------------
        setSubmitting(true)
        const payload: any = {
            resource,
            resource_id,
            action: Object.keys(selectedActions).filter(k => selectedActions[k].selected)
        }
        if (shareWith === "users") {
            payload.email   = selectedEmails
            payload.message = message
        }
        else if (shareWith === "groups") {
            payload.user_group_id = selectedGroups
        }
        else if (shareWith === "roles") {
            payload.role = Object.keys(selectedRoles).filter(k => selectedRoles[k])
        }
        request("/api/permissions/grant", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
        }).then(
            () => {
                setSubmitting(false)
                close()
            },
            error => {
                setError(error.message)
                setSubmitting(false)
            }
        ).finally(() => setSubmitting(false))
        // ---------------------------------------------------------------------
    }

    const getValidationError = () => {
        if (!Object.keys(selectedActions).some(k => selectedActions[k].selected)) {
            return "At least one action should be allowed"
        }

        if (shareWith === "users") {
            if (!selectedEmails.length) {
                return "No emails selected"
            }
        }

        if (shareWith === "groups") {
            if (!selectedGroups.length) {
                return "No user groups selected"
            }
        }

        if (shareWith === "roles") {
            if (!Object.keys(selectedRoles).some(k => selectedRoles[k])) {
                return "No user roles selected"
            }
        }

        return ""
    }

    const getHeader = () => {
        return <><i className="fas fa-share-alt-square" /> {dialogTitle}</>
    }

    const getFooter = (close: () => void) => {
        return <div aria-disabled={submitting}>
            <button className="btn color-red m-05"   style={{ minWidth: "8em" }} onClick={() => close()}>Cancel</button>
            <button className="btn color-green m-05" style={{ minWidth: "8em" }} onClick={() => submit(close)}>Apply</button>
        </div>
    }

    const getBody = (close: () => void) => {
        if (loadingUserEmails || loadingUserGroups || loadingActions) {
            return <Loader msg="Loading..." />
        }
    
        if (loadingUserEmailsError) {
            return <AlertError>{ loadingUserEmailsError }</AlertError>
        }
    
        if (loadingUserGroupsError) {
            return <AlertError>{ loadingUserGroupsError }</AlertError>
        }

        if (loadingActionsError) {
            return <AlertError>{ loadingActionsError }</AlertError>
        }

        return (
            <form onSubmit={e => { e.preventDefault(); submit(close); } } className="m-1">
                { validationError && <AlertError>{ validationError }</AlertError> }
                { error && <AlertError>The server rejected this attempt with the following message: { error }</AlertError> }
                <div aria-disabled={submitting}>
                    <div>
                        <Grid gap="2rem" cols="auto auto auto">
                            <label style={{ fontWeight: 400 }}>
                                <input name="share-with" type="radio" checked={ shareWith === "users"  } onChange={ () => setShareWith("users" )} /> Share With Users
                            </label>
                            <label style={{ fontWeight: 400 }}>
                                <input name="share-with" type="radio" checked={ shareWith === "groups" } onChange={ () => setShareWith("groups")} /> Share With User Groups
                            </label>
                            <label style={{ fontWeight: 400 }}>
                                <input name="share-with" type="radio" checked={ shareWith === "roles"  } onChange={ () => setShareWith("roles" )} /> Share With User Roles
                            </label>
                        </Grid>
                    </div>
                    <br/>
                    {
                        shareWith === "groups" && <>
                            <label className="color-blue">Selected User Groups</label>
                            <hr />
                            <Grid cols="1fr 1fr">
                                <UserGroupList
                                    groups={ userGroups.map(g => ({ ...g, selected: selectedGroups.includes(g.id) }))}
                                    onChange={ groups => setSelectedGroups(groups.filter(g => g.selected).map(g => g.id)) }
                                />
                            </Grid>
                        </>
                    }
                    {
                        shareWith === "users" && <>
                            <EmailSelector emails={userEmails} selection={selectedEmails} onChange={setSelectedEmails} />
                            <div className="mt-1">
                                <label className="color-blue">Message to recipients</label>
                                <textarea
                                    rows={4}
                                    placeholder="Optional message to send to recipients"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>
                        </>
                    }
                    {
                        shareWith === "roles" && <>
                            <label className="color-blue">Selected Roles</label>
                            <hr />
                            <Grid cols="1fr 1fr">
                                <RoleList roles={selectedRoles} onChange={setSelectedRoles}/>
                            </Grid>
                        </>
                    }
                    <br />
                    <label className="color-blue">Allowed actions</label>
                    <hr />
                    <Grid cols="1fr 1fr" gap="0 1rem">
                        <ActionsList actions={selectedActions} onChange={setSelectedActions} user={user!} resource={resource} />
                    </Grid>
                </div>
            </form>
        )
    }

    useEffect(() => {
        
        setLoadingActions(true)
        request<string[]>("/api/permissions/actions?resource=Graphs")
            .then(actions => {
                const selectedActions: Record<string, { selected: boolean }> = {}
                actions.forEach(action => selectedActions[action] = { selected: action === "read"})
                setSelectedActions(selectedActions)
            }, setLoadingActionsError)
            .finally(() => setLoadingActions(false))

        if (canReadUsers) {
            setLoadingUserEmails(true)
            request<{ email: string }[]>("/api/users?attributes=email").then(
                rows => setUserEmails(rows.map(row => row.email)),
                error => setLoadingUserEmailsError(error)
            ).finally(() => setLoadingUserEmails(false))
        }
        
        if (canReadUserGroups) {
            setLoadingUserGroups(true)
            request<app.UserGroup[]>("/api/user-groups?attributes=id,name,description").then(
                rows => setUserGroups(rows),
                error => setLoadingUserGroupsError(error)
            ).finally(() => setLoadingUserGroups(false))
        }


    }, [ canReadUsers, canReadUserGroups ]);

    return <Dialog
        modal
        header={ getHeader() }
        body={ ({ close }) => getBody(close) }
        footer={ ({ close }) => getFooter(close) }
        style={{ width: 650 }}
    />
}
