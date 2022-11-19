import { useEffect, useMemo, useState } from "react"
import { useNavigate }                  from "react-router"
import { request }                      from "../../backend"


export default function EndpointCreateWrapper({
    endpoint,
    children
}: {
    endpoint: string
    children: (props: {
        loading : boolean
        data    : any
        onSubmit: (data: any) => void
        error   : Error | string | null
    }) => JSX.Element
})
{
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [saveError  , setSaveError] = useState<Error|string|null>(null)
    const abortController = useMemo(() => new AbortController(), [])

    function onSubmit(data: Record<string, any>) {
        setSaving(true)
        setSaveError(null)

        request(endpoint, {
            method: "POST",
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

    useEffect(() => () => abortController.abort(), [ abortController ]);

    return children({
        loading : saving,
        data    : {},
        onSubmit,
        error   : saveError
    })
}
