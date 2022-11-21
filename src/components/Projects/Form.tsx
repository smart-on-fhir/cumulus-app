import { FormEvent, useState } from "react"
import Checkbox from "../Checkbox"
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
    const [ graphs     , setGraphs      ] = useState("")
    const [ subs       , setSubs        ] = useState("")

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
                        rows={8}
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={ !!loading }
                    />
                </div>
            </div>
            <div className="row gap">
                <div className="col mt-1">
                    <b>Included Subscriptions</b>
                    <Checkbox
                        type="radio"
                        label="Select Manually"
                        name="subs"
                        checked={subs === "manual"}
                        onChange={() => setSubs("manual")}
                        description="Select one or more Data Subscriptions to be included in this project"
                    />
                    <Checkbox
                        type="radio"
                        label="Data Subscription Group"
                        name="subs"
                        checked={subs === "group"}
                        onChange={() => setSubs("group")}
                        description="ALL Data Subscriptions belonging to the specified group will be included in this project"
                    />
                    <Checkbox
                        type="radio"
                        label="Subscriptions by Tags"
                        name="subs"
                        checked={subs === "tag"}
                        onChange={() => setSubs("tag")}
                        description="Only data subscriptions having some of the selected tags will be included in this project"
                    />
                    <br/>
                    <select disabled>
                        <option>TODO: UI depends on the selection above</option>
                    </select>
                </div>
                <div className="col mt-1">
                    <b>Included Graphs</b>
                    <Checkbox
                        type="radio"
                        label="Select Manually"
                        name="graphs"
                        disabled
                        checked={graphs === "manual"}
                        onChange={() => setGraphs("manual")}
                        description="Select one or more Graphs to be included in this project"
                    />
                    <Checkbox
                        type="radio"
                        label="Use Subscription Graphs"
                        name="graphs"
                        checked={graphs === "sub"}
                        onChange={() => setGraphs("sub")}
                        description="Only Graphs that belong to the included subscriptions will be included in this project"
                    />
                    <Checkbox
                        type="radio"
                        label="Use Tags"
                        name="graphs"
                        checked={graphs === "tag"}
                        onChange={() => setGraphs("tag")}
                        description="Only graphs having some of the selected tags will be included in this project"
                    />
                    <br/>
                    <select disabled>
                        <option>TODO: UI depends on the selection above</option>
                    </select>
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