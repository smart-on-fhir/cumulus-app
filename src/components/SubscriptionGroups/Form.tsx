import { FormEvent, useState } from "react"
import MarkdownEditor          from "../generic/MarkdownEditor"
import { app }                 from "../../types"


export default function Form({
    record = { name: "", description: "" },
    saving,
    onSubmit
}: {
    record?: Partial<app.SubscriptionGroup>
    saving?: boolean
    onSubmit: (record: Partial<app.SubscriptionGroup>) => void
})
{
    const [name, setName] = useState(record.name)
    const [description, setDescription] = useState(record.description)
 
    function _onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        onSubmit({ name, description })
    }

    return (
        <form onSubmit={ _onSubmit }>
            <fieldset className="mt-1">
                <label>Name</label>
                <input type="text" name="subscriptionGroupName" value={name} onChange={e => setName(e.target.value)} required />
            </fieldset>
            <fieldset className="mt-2">
                <MarkdownEditor height="30vh" textarea={{
                    name    : "subscriptionGroupDescription",
                    value   : description,
                    rows    : 10,
                    onChange: e => setDescription(e.target.value)
                }} />
            </fieldset>
            <hr className="mt-2 mb-2" />
            <div className="center mb-2">
                <button
                    className="btn btn-green"
                    type="submit"
                    style={{ minWidth: "8em" }}
                >
                    { saving && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                    Save
                </button>
            </div>
        </form>
    )
}
