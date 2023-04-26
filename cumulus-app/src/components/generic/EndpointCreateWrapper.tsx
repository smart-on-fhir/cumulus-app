import { useEffect, useMemo, useState } from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { useNavigate }                  from "react-router"
import { request }                      from "../../backend"
import { AlertError } from "./Alert"
import Breadcrumbs from "./Breadcrumbs"


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

export function createCreatePage<T = unknown>({
    nameSingular,
    namePlural,
    endpoint,
    basePath,
    renderForm
}: {
    nameSingular     : string
    namePlural       : string
    endpoint         : string
    basePath         : string
    renderForm       : (props: {
        loading : boolean
        data    : T
        onSubmit: (data: Partial<T>) => void
    }) => JSX.Element
})
{
    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Create { nameSingular }</title>
                </Helmet>
            </HelmetProvider>
            <EndpointCreateWrapper endpoint={ endpoint }>
                {({ data, error, loading, onSubmit }) => (
                    <>
                        <Breadcrumbs links={[
                            { name: "Home", href: "/" },
                            { name: namePlural, href: basePath },
                            { name: "Create " + nameSingular }
                        ]} />
                        <h4>
                            <i className="fa-solid fa-circle-plus color-brand-2" /> Create { nameSingular }
                        </h4>
                        <hr className="mb-1" />
                        { error && <AlertError>{ error }</AlertError> }
                        { renderForm({ data: data as T, onSubmit, loading }) }
                    </>
                )}
            </EndpointCreateWrapper>
        </div>
    )
}
