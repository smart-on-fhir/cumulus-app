import { useCallback } from "react"
import { useParams }   from "react-router"
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { AlertError }  from "../Alert"
import Loader          from "../Loader"


export default function EndpointViewWrapper({
    endpoint,
    children
}: {
    endpoint: string
    children: (data: any) => JSX.Element
})
{
    const { id } = useParams()
    
    let { result: data, loading, error } = useBackend(
        useCallback(signal => request(`${endpoint}/${id}`, { signal }), [id, endpoint]),
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

