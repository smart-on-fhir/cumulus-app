import { useCallback } from "react"
import { request }     from "../../../backend"
import { useBackend }  from "../../../hooks"
import { app }         from "../../../types"
import { AlertError }  from "../../generic/Alert"
import Loader          from "../../generic/Loader"
import StaticGrid      from "../../generic/StaticGrid"


export default function UserGridWrapper({
    selection = [],
    onSelectionChange
}: {
    selection?: app.User[]
    onSelectionChange?: (selection: app.User[]) => void
}) {

    let { result: data, loading, error } = useBackend(
        useCallback(signal => request("/api/users", { signal }), []),
        true
    )

    if (loading) {
        return <Loader msg="Loading users..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!data) {
        return <AlertError>Failed fetching users</AlertError>
    }

    return <UserGrid users={data} selection={selection} onSelectionChange={onSelectionChange} />
}

export function UserGrid({
    users,
    selection = [],
    onSelectionChange
}: {
    users: app.User[]
    selection?: app.User[]
    onSelectionChange?: (selection: app.User[]) => void
}) {
    return (
        <StaticGrid
            columns={[
                { name: "id"   , type: "number" },
                { name: "email", type: "string" },
                { name: "role" , type: "string" }
            ]}
            rows={users}
            selectionType={ onSelectionChange ? "multiple" : "none" }
            selection={ selection }
            onSelectionChange={ onSelectionChange }
            equals={(a, b) => +a.id === +b.id}
        />
    )
}
