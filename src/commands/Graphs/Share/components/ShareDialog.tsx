import { useEffect, useState } from "react"
import { request }             from "../../../../backend"
import { AlertError }          from "../../../../components/generic/Alert"
import Dialog                  from "../../../../components/generic/Dialog"
import Grid                    from "../../../../components/generic/Grid"
import Loader                  from "../../../../components/generic/Loader"
import { app }                 from "../../../../types"
import ActionsList             from "./ActionsList"
import EmailSelector           from "./EmailSelector"
import ResourceIdSelector      from "./ResourceIdSelector"
import RoleList                from "./RoleList"
import UserGroupList           from "./UserGroupList"


export default function ShareDialog({
    user = null,
    resource,
    selectedResources,
    dialogTitle = "Create or Update Permissions",
    onComplete
}: {
    user?: app.User | null
    resource: string
    selectedResources?: any[]
    dialogTitle?: string
    onComplete?: () => void
})
{
    const canReadUsers      = !!user?.permissions.includes("Users.read");
    const canReadUserGroups = !!user?.permissions.includes("UserGroups.read");

    const [resourceType          , setResourceType          ] = useState<string>(resource);
    const [resources             , setResources             ] = useState<any[] | undefined>(selectedResources);
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

    const isLoading = loadingUserEmails || loadingUserGroups || loadingActions


    const submit = (close: () => void) => {
        const error = getValidationError()
        if (error) {
            return setValidationError(error)
        }
        
        setValidationError("")

        // ---------------------------------------------------------------------
        setSubmitting(true)
        const payload: any = {
            resource: resourceType,
            resource_id: resources?.length ? resources.map(r => r.id) : undefined,
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
        if (loadingUserEmails || loadingUserGroups) {
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
                <div aria-disabled={ submitting || isLoading }>
                    { (!resource || !selectedResources) && <>
                        <div className="mb-1">
                            <label className="color-blue">Share What</label>
                            <hr className="mb-05" />
                            { !resource && <>
                                <p>
                                    <b style={{ fontWeight: 500 }}>Resource Type</b>
                                    <span className="color-muted pull-right">Select the type of resources you want to manage access to</span>
                                </p>
                                <select className="mb-1" value={resourceType} onChange={e => {
                                    setResources([])
                                    setResourceType(e.target.value)
                                }}>
                                    <option value="" disabled>Please Select</option>
                                    <option value="SubscriptionGroups">Data Source Groups</option>
                                    <option value="Graphs">Graphs</option>
                                    <option value="Subscriptions">Data Sources</option>
                                    <option value="DataSites">DataSites</option>
                                    <option value="StudyAreas">StudyAreas</option>
                                    <option value="Tags">Tags</option>
                                    <option value="UserGroups">UserGroups</option>
                                </select>
                            </> }
                            { (resourceType && !selectedResources) && <>
                                <p>
                                    <b style={{ fontWeight: 500 }}>Resources</b>
                                    <span className="color-muted pull-right">Select resources to manage or leave this empty to manage them all</span>
                                </p>
                                <ResourceIdSelector resourceType={resourceType} selection={resources || []} onSelectionChange={setResources}/>
                            </> }
                        </div>
                    </> }
                    <div>
                        <label className="color-blue">Share with Who</label>
                        <hr />
                        <Grid cols="1fr 1fr 1fr" gap="2rem 1rem">
                            <label style={{ fontWeight: 400 }}>
                                <input name="share-with" type="radio" checked={ shareWith === "users"  } onChange={ () => setShareWith("users" )} /> Users
                            </label>
                            <label style={{ fontWeight: 400 }}>
                                <input name="share-with" type="radio" checked={ shareWith === "groups" } onChange={ () => setShareWith("groups")} /> User Groups
                            </label>
                            { resource && <label style={{ fontWeight: 400 }}>
                                <input name="share-with" type="radio" checked={ shareWith === "roles"  } onChange={ () => setShareWith("roles" )} /> User Roles
                            </label> }
                        </Grid>
                    </div>
                    <br/>
                    {
                        shareWith === "groups" && <>
                            <label className="color-blue">Selected User Groups</label>
                            <hr />
                            <Grid cols="1fr 1fr 1fr" gap="0 1rem">
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
                                <label className="color-blue">Message to Recipients</label>
                                <textarea
                                    rows={3}
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
                            <Grid cols="1fr 1fr 1fr" gap="0 1rem">
                                <RoleList roles={selectedRoles} onChange={setSelectedRoles} />
                            </Grid>
                        </>
                    }
                    { resourceType && <>
                        <br />
                        <label className="color-blue">Allowed Actions</label>
                        <hr />
                        <Grid cols="1fr 1fr 1fr" gap="0 1rem">
                            <ActionsList actions={selectedActions} onChange={setSelectedActions} />
                        </Grid>
                    </> }
                </div>
            </form>
        )
    }

    useEffect(() => {
        if (resourceType) {
            setLoadingActions(true)
            request<string[]>(`/api/permissions/actions?resource=${resourceType}&resource_id=${resources?.map(r => r.id)}`)
                .then(actions => {
                    const selectedActions: Record<string, { selected: boolean }> = {}
                    actions.forEach(action => selectedActions[action] = { selected: action === "read"})
                    setSelectedActions(selectedActions)
                }, setLoadingActionsError)
                .finally(() => setLoadingActions(false))
        }
    }, [resourceType, resources])

    useEffect(() => {
        
        if (canReadUsers) {
            setLoadingUserEmails(true)
            request<{ email: string }[]>("/api/users?attributes=email").then(
                rows => setUserEmails(rows.map(row => row.email)),
                error => setLoadingUserEmailsError(error)
            ).finally(() => setLoadingUserEmails(false))
        }
    }, [ canReadUsers ]);
    
    useEffect(() => {
        if (canReadUserGroups) {
            setLoadingUserGroups(true)
            request<app.UserGroup[]>("/api/user-groups?attributes=id,name,description").then(
                rows => setUserGroups(rows),
                error => setLoadingUserGroupsError(error)
            ).finally(() => setLoadingUserGroups(false))
        }

    }, [ canReadUserGroups ]);

    return <Dialog
        modal
        header={ getHeader() }
        body={ ({ close }) => getBody(close) }
        footer={ ({ close }) => getFooter(close) }
        style={{ width: 650 }}
        onComplete={ onComplete }
    />
}
