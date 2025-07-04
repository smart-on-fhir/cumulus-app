import { ReactNode, useCallback } from "react"
import { request, RequestOptions }     from "../../backend"
import { useBackend }  from "../../hooks"
import Loader          from "./Loader"
import { AlertError }  from "./Alert"


export default function Prefetch<T=any>({
    path,
    children,
    requestOptions
}: {
    path: string
    children: (data: T) => ReactNode
    requestOptions?: RequestOptions
}) {
    let { result, loading, error } = useBackend(
        useCallback(signal => {
            return request<T>(path, { ...requestOptions, signal })
        }, [path]),
        true
    )

    if (loading) {
        return <Loader msg="Loading data..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!result) {
        return <AlertError>Failed fetching data from { JSON.stringify(path) }</AlertError>
    }

    return children(result)
}
