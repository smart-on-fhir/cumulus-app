import { useEffect, useState }               from "react"
import Select, { SelectOption, SelectProps } from "."
import Loader                                from "../Loader"
import { AlertError }                        from "../Alert"


interface DatasetSelectProps extends SelectProps {
    load: () => Promise<SelectOption[]>
}

export default function LoadableSelect(props: DatasetSelectProps)
{
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string>("")
    const [list   , setList   ] = useState<SelectOption[]>([])
    const { load, ...rest } = props

    useEffect(() => {
        load().then(options => setList(options)).catch(setError).finally(() => setLoading(false))
    }, [load])

    if (loading) {
        return <div className="form-control select-component"><Loader msg="Loading datasets" /></div>
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    return <Select { ...rest } options={ list } />
}
