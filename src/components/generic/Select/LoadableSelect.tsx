import { useEffect, useState }               from "react"
import Loader                                from "../Loader"
import { AlertError }                        from "../Alert"


interface LoadableSelectOption {
    name: string
    value: string
}

interface LoadableSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    load: () => Promise<LoadableSelectOption[] | Record<string, LoadableSelectOption[]>>
    prependOptions?: LoadableSelectOption[]
    appendOptions?: LoadableSelectOption[]
}

export default function LoadableSelect(props: LoadableSelectProps)
{
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string>("")
    const [list   , setList   ] = useState<LoadableSelectOption[] | Record<string, LoadableSelectOption[]>>([])
    const { load, ...rest } = props

    useEffect(() => {
        load().then(options => setList(options)).catch(setError).finally(() => setLoading(false))
    }, [load])

    if (loading) {
        return <div className="form-control select-component"><Loader msg="Loading datasets" /></div>
    }

    if (error) {
        return <AlertError className="form-control pl-2" style={{ margin: 0 }}>{ error + "" }</AlertError>
    }

    return (
        <select className="form-control select-component" { ...rest }>
            { props.prependOptions?.map((o, i) => <option key={i} value={o.value} title={o.value}>{o.name}</option>) }
            { Array.isArray(list) ?
                list.map((o, i) => <option key={i} value={o.value} title={o.value}>{o.name}</option>) :
                Object.keys(list).map((group, i) => {
                    return (
                        <optgroup key={i} label={group}>
                            { list[group].map((o, y) => <option key={y} value={o.value} title={o.value}>{o.name}</option>) }
                        </optgroup>
                    )
                })
            }
            { props.appendOptions?.map((o, i) => <option key={i} value={o.value} title={o.value}>{o.name}</option>) }
        </select>
    )
}
