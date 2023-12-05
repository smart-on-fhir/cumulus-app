import { FormEvent, useState } from "react"
import { app }                 from "../../types"
import Loader                  from "../generic/Loader"
import UserGrid                from "./UserGrid"


export default function Form({ data = {}, onSubmit, loading, error }: {
    data?: Record<string, any>
    onSubmit: (data: Record<string, any>) => void
    loading?: boolean
    error?: Error | string | null
})
{
    const [ name       , setName        ] = useState(data.name        || "")
    const [ description, setDescription ] = useState(data.description || "")
    const [ users      , setUsers       ] = useState<app.User[]>(data.users || [])

    const valid = name && description

    function submit(ev: FormEvent) {
        ev.preventDefault()
        onSubmit({ name, description, users })
    }

    return (
        <form onSubmit={ submit } autoComplete="off">
            <div className="row">
                <div className="col">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Group name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={ !!loading }
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Group description"
                        rows={4}
                        maxLength={200}
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={ !!loading }
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label htmlFor="name">Included Users</label>
                    <UserGrid selection={users} onSelectionChange={setUsers} />
                </div>
            </div>
            
            <hr className="mb-2 mt-2" />
            <div className="mb-2 center">
                <button
                    type="submit"
                    className="btn btn-blue pl-2 pr-2"
                    disabled={ !valid || loading }
                    style={{ minWidth: "8em" }}
                >Save{ loading && <>&nbsp;<Loader msg="" /></> }</button>
            </div>
        </form>
    )
}



