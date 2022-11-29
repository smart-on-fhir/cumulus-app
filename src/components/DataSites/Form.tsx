import { FormEvent } from "react";

export default function DataSiteForm({
    data = {},
    onSubmit,
    loading
}: {
    data?: Partial<app.DataSite>
    onSubmit: (data: any) => void
    loading: boolean
})
{
    function _onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData    = new FormData(e.currentTarget);
        const name        = formData.get("name") as string;
        const setting     = formData.get("setting") as string;
        const description = formData.get("description") as string;
        const lat         = parseFloat(formData.get("latitude") as string);
        const long        = parseFloat(formData.get("longitude") as string);

        onSubmit({
            name,
            description,
            setting,
            lat : isNaN(lat) ? null : lat,
            long: isNaN(long) ? null : long
        })
    }

    return (
        <form onSubmit={ _onSubmit }>
            <datalist id="site-setting">
                <option>ED</option>
                <option>Inpatient</option>
                <option>Outpatient</option>
            </datalist>
            <div className="row gap-2 wrap">
                <div className="col col-5 responsive mb-1">
                    <label>Name</label>
                    <input type="text" name="name"  defaultValue={String(data.name || "")} required />
                </div>
                <div className="col col-5 responsive mb-1">
                    <label>Setting</label>
                    <input
                        type="text"
                        name="setting"
                        defaultValue={String(data.setting || "")}
                        list="site-setting"
                        placeholder="ED, Inpatient, Outpatient or other care locations"
                    />
                </div>
            </div>
            
            <div className="row gap-2 wrap">
                <div className="col col-5 responsive mb-1">
                    <label>Latitude</label>
                    <input type="number" min={0} max={90} name="latitude" defaultValue={String(data.lat || "")} />    
                </div>
                <div className="col col-5 responsive mb-1">
                    <label>Longitude</label>
                    <input type="number" min={-180} max={180} name="longitude" defaultValue={String(data.long || "")} />
                </div>
            </div>
            
            <div className="row gap mb-1">
                <div className="col">
                    <label>Description</label>
                    <textarea name="description" defaultValue={String(data.description || "")} rows={5} />
                </div>
            </div>
            <hr className="mt-2 mb-2"/>
            <div className="center mb-2">
                <button
                    className="btn btn-green"
                    type="submit"
                    style={{ minWidth: "8em" }}
                >
                    { loading && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                    Save
                </button>
            </div>
        </form>
    )
}
