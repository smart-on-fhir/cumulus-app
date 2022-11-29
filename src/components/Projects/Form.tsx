import { FormEvent, useState } from "react"
import Loader from "../generic/Loader"
import LinkWidget from "./LinkWidget"

export default function Form({ data = {}, onSubmit, loading, error }: {
    data?: Record<string, any>
    onSubmit: (data: Record<string, any>) => void
    loading?: boolean
    error?: Error | string | null
})
{
    const [ name         , setName          ] = useState(data.name        || "")
    const [ description  , setDescription   ] = useState(data.description || "")
    const [ subscriptions, setSubscriptions ] = useState(
        (data.Subscriptions || []).map((s: app.DataRequest) => s.id).join(",")
    )

    const valid = name && description

    function submit(ev: FormEvent) {
        ev.preventDefault()
        onSubmit({
            name,
            description,
            Subscriptions: subscriptions.split(",").filter(Boolean).map(parseFloat)
        })
    }

    return (
        <form onSubmit={ submit } autoComplete="off">
            <div className="row gap-2 mt-2 wrap stretch" style={{
                minHeight: "calc(100vh - 22rem)",
                // minHeight: "20rem",
                // maxHeight: "max-content"
            }}>
                <div className="col col-6 responsive">
                    <div className="row">
                        <div className="col mb-1">
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
                    <div className="row row-10">
                        <div className="col mb-1 stretch">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Project description"
                                // rows={8}
                                style={{ height: "100%", minHeight: "10em" }}
                                required
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={ !!loading }
                            />
                        </div>
                    </div>
                </div>
                <div className="col col-6 mb-1 responsive">
                    <label>Included Subscriptions</label>
                    <LinkWidget
                        value={subscriptions}
                        onChange={setSubscriptions}
                    />
                </div>
            </div>
            <hr className="mb-2 mt-1" />
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