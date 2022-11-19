import { useCallback, useEffect, useMemo, useState }  from "react"
import { useNavigate, useParams } from "react-router"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../Alert"
import Loader                     from "../Loader"


export default function EndpointDeleteWrapper({
    endpoint,
    children
}: {
    endpoint: string
    children: (props: {
        loading : boolean
        data    : any
        onSubmit: () => void
        error: Error | string | null
    }) => JSX.Element
})
{
    const { id } = useParams()
    const navigate = useNavigate()
    const [working, setWorking] = useState(false)
    const [saveError, setSaveError] = useState<Error|string|null>(null)
    const abortController = useMemo(() => new AbortController(), [])

    let { result, loading, error } = useBackend(
        useCallback(signal => request(`${endpoint}/${id}`, { signal }), [id, endpoint]),
        true
    )

    function onSubmit() {
        setWorking(true)
        setSaveError(null)
        request(`${endpoint}/${id}`, { method: "DELETE", signal: abortController.signal })
        .then(() => {
            if (!abortController.signal.aborted) {
                navigate("..")
            }
        })
        .catch(error => {
            if (!abortController.signal.aborted) {
                setSaveError(error)
                setWorking(false)
            }
        })
    }

    useEffect(() => () => abortController.abort(), [ abortController ]);

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
        loading: working,
        data   : result,
        error  : saveError,
        onSubmit
    })
}

