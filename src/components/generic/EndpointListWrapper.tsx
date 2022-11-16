import { useCallback } from "react"
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { AlertError }  from "../Alert"
import Loader          from "../Loader"


export default function EndpointListWrapper({
    endpoint,
    children
}: {
    endpoint: string
    children: (data: any) => JSX.Element
})
{
    let { result: data, loading, error } = useBackend(
        useCallback(signal => request(endpoint, { signal }), [endpoint]),
        true
    )

    if (loading) {
        return <Loader msg="Loading data..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!data) {
        return <AlertError>Failed fetching data from the server</AlertError>
    }

    return children(data)
}

