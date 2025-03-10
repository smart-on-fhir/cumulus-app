import { useEffect, useState } from "react"
import { request }             from "../../../../backend"
import { AlertError }          from "../../../../components/generic/Alert"
import Loader                  from "../../../../components/generic/Loader"
import StaticGrid              from "../../../../components/generic/StaticGrid"


const map = {
    SubscriptionGroups: { url: "/api/request-groups" },
    Graphs            : { url: "/api/views?attributes=id,name" },
    Subscriptions     : { url: "/api/requests?attributes=id,name" },
    StudyAreas        : { url: "/api/study-areas?attributes=id,name" },
    Tags              : { url: "/api/tags?attributes=id,name" },
    UserGroups        : { url: "/api/user-groups?attributes=id,name" },
}

export default function ResourceIdSelector({
    resourceType = "Graphs",
    selection,
    onSelectionChange,
}: {
    resourceType?: string
    selection    : any[]
    onSelectionChange: (selection: number[]) => void
})
{
    const { url } = map[resourceType as keyof typeof map];

    const [ loading, setLoading ] = useState<boolean>(true)
    const [ error  , setError   ] = useState<Error | null>(null)
    const [ data   , setData    ] = useState<any>(null)

    useEffect(() => {
        request(url).then(setData, setError).finally(() => setLoading(false))
    }, [url])

    if (loading) {
        return <Loader msg="Loading data..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!data) {
        return <AlertError>Failed fetching data from the server</AlertError>
    }


    return <StaticGrid
        columns={[
            {
                name : "id",
                label: "ID",
                type : "number",
                style: { width: "3em" }
            },
            {
                name  : "name",
                label : "Name",
                type  : "string",
                style: { maxWidth: "30em" }
            }
        ]}
        rows={data.filter((x: any) => !!x.id)}
        selectionType="multiple"
        selection={selection}
        onSelectionChange={onSelectionChange}
        maxHeight="17vh"
    />
}