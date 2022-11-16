import { useCallback, useEffect, useMemo, useState }  from "react"
import { useNavigate, useParams } from "react-router"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../Alert"
import Loader                     from "../Loader"


export default function EndpointEditWrapper({
    endpoint,
    children
}: {
    endpoint: string
    children: (props: {
        loading : boolean
        data    : any
        onSubmit: (data: any) => void
        error: Error | string | null
    }) => JSX.Element
})
{
    const { id } = useParams()
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [saveError  , setSaveError] = useState<Error|string|null>(null)
    const abortController = useMemo(() => new AbortController(), [])

    let { result, loading, error } = useBackend(
        useCallback(signal => request(`${endpoint}/${id}`, { signal }), [id]),
        true
    )

    function onSubmit(data: Record<string, any>) {
        setSaving(true)
        setSaveError(null)
        request(`${endpoint}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "content-type": "application/json" },
            signal: abortController.signal
        })
        .then(() => {
            if (!abortController.signal.aborted) {
                navigate("..")
            }
        })
        .catch(error => {
            if (!abortController.signal.aborted) {
                setSaveError(error)
                setSaving(false)
            }
        })
    }

    useEffect(() => () => abortController.abort(), []);

    if (loading) {
        return <Loader msg="Loading data..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!result) {
        return <AlertError>Failed fetching data from the server</AlertError>
    }

    return children({
        loading: saving,
        data   : result,
        error  : saveError,
        onSubmit
    })
}

