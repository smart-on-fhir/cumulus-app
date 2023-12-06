import { useEffect, useState }  from "react"
import { request }              from "../../../../backend"
import { AlertError }           from "../../../../components/generic/Alert"
import Dialog, { centerDialog } from "../../../../components/generic/Dialog"
import StaticGrid               from "../../../../components/generic/StaticGrid"
import { app }                  from "../../../../types"
import { buildPermissionLabel } from "../../../../utils"


interface Permission {
    id        : number
    permission: boolean
    action    : string
    actorType : string
    actor     : string
}


export default function PermissionsDialog({
    user = null,
    resource,
    resource_id
}: {
    user?: app.User | null
    resource: string
    resource_id: number
})
{
    const [selection, setSelection ] = useState<number[]>([])
    const [loading  , setLoading   ] = useState<boolean>(false)
    const [error    , setError     ] = useState<Error|null>(null)
    const [data     , setData      ] = useState<Permission[]>([])

    const deleteSelected = () => {
        setLoading(true)
        return request("/api/permissions?id=" + selection.join(","), { method: "DELETE" }).then(
            () => {
                setError(null)
                return fetchPermissions()
            },
            setError
        ).finally(() => setLoading(false))
    }

    const fetchPermissions = () => {
        setLoading(true)
        return request<Permission[]>(`/api/permissions/list?resource=${resource}&resource_id=${resource_id}`)
            .then(setData, setError)
            .finally(() => setLoading(false))
    }

    const getHeader = () => {
        return <><i className="fas fa-share-alt-square" /> Manage Permissions</>
    }

    const getFooter = (close: () => void) => {
        return <div aria-disabled={loading}>
            <button
                type="button"
                className="btn m-05"
                style={{ minWidth: "11em" }}
                onClick={() => close()}
            >Close</button>
            {  data.length > 0 && <button
                type="button"
                className={ selection.length ? "btn-brand-2" : "btn" }
                style={{ minWidth: "11em" }}
                disabled={!selection.length}
                onClick={() => deleteSelected()}
            >Remove selected</button> }
        </div>
    }

    const getBody = () => {
        return <>
            <div className="p-1">
                { data.length === 0  ?
                    <div className="m-05 center color-brand-2">
                        <b>This resource is not currently shared with anybody.</b>
                    </div> :
                    <div aria-disabled={loading}>
                        <div className="mb-1">
                            These are the users or user groups this resource has been shared with. You
                            can select one or more and then click on "Remove Selected" to 
                            delete those records and effectively un-share the resource.
                        </div>
                        { error && <AlertError>{ error }</AlertError> }
                        <StaticGrid
                            columns={[
                                {
                                    name : "actor",
                                    label: "Actor",
                                    type : "string",
                                    render: r => <>
                                        { r.actorType === "User" ?
                                            <i className="fas fa-user color-blue center" style={{width: "1.3em"}} /> :
                                            <i className="far fa-folder-open color-blue center" style={{width: "1.3em"}}/>
                                        }
                                        <span> { r.actor }</span>
                                    </>
                                },
                                {
                                    name  : "action",
                                    label : "Permission",
                                    type  : "string",
                                    render: (r, c) => r.permission ?
                                         <span className="color-green">Can <b>{ r.action }</b></span> :
                                         <span className="color-red">Cannot <b>{ r.action }</b></span>
                                }
                            ]}
                            rows={data}
                            selectBy="id"
                            selection={selection}
                            onSelectionChange={setSelection}
                            rowTitle={buildPermissionLabel}
                            key={data.length}
                            maxHeight="42vh"
                        />
                    </div>
                }
            </div>
        </>
    }

    useEffect(() => { fetchPermissions() }, []);
    useEffect(() => { centerDialog() }, [!!data.length])

    return <Dialog
        modal
        header={ getHeader() }
        body={ () => getBody() }
        footer={ ({ close }) => getFooter(close) }
        style={{ width: 540, maxHeight: "70vh" }}
    />
}
