import { FormEvent } from "react"
import "./RequestGroups.scss"


export default function Form({
    record = { name: "", description: "" },
    saving,
    onSubmit
}: {
    record?: Partial<app.RequestGroup>
    saving?: boolean
    onSubmit: (record: Partial<app.RequestGroup>) => void
})
{
 
    function _onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData    = new FormData(e.currentTarget)
        const name        = formData.get("requestGroupName") as string
        const description = formData.get("requestGroupDescription") as string
        onSubmit({ name, description })
    }

    return (
        <form onSubmit={ _onSubmit }>
            { record.createdAt && record.updatedAt && <div className="row gap mb-2 mt-05">
                <div className="col small color-muted">
                    <div>
                        <b>Created at </b>
                        <span className="nowrap">{ new Date(record.createdAt).toLocaleString() }</span>
                    </div>
                </div>
                <div className="col small color-muted right">
                    <div>
                        <b>Updated at </b>
                        <span className="nowrap">{ new Date(record.updatedAt).toLocaleString() }</span>
                    </div>
                </div>
            </div> }
            <fieldset className="mt-1">
                <label>Name</label>
                <input type="text" name="requestGroupName" defaultValue={ record.name } required />
            </fieldset>
            <fieldset className="mt-2">
                <label>Description</label>
                <textarea name="requestGroupDescription" defaultValue={ record.description } rows={6} />
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
