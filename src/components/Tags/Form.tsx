import { FormEvent, useState } from "react"
import Loader from "../Loader"

export default function Form({ data = {}, onSubmit, loading, error }: {
    data?: Record<string, any>
    onSubmit: (data: Record<string, any>) => void
    loading?: boolean
    error?: Error | string | null
})
{
    const [ name       , setName        ] = useState(data.name        || "")
    const [ description, setDescription ] = useState(data.description || "")

    const valid = name && description

    function submit(ev: FormEvent) {
        ev.preventDefault()
        onSubmit({ name, description })
    }

    return (
        <form onSubmit={ submit } autoComplete="off">
            <div className="row gap mt-2">
                <div className="col">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Project name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={ !!loading }
                    />
                </div>
            </div>
            <div className="row gap mt-1">
                <div className="col">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Project description"
                        rows={10}
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={ !!loading }
                    />
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