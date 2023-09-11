import moment   from "moment"
import Checkbox from "../../generic/Checkbox"
import { app }  from "../../../types"


export default function TransmissionEditor({
    data,
    onChange,
    sites
}: {
    data: app.Transmission
    sites: app.DataSite[]
    onChange: (data: Partial<app.Transmission>) => void
})
{
    return (
        <>
        <div className="row half-gap mb-05">
            <div className="col col-2 small middle right nowrap">Transmitted</div>
            <div className="col col-3 small">
                <input
                    type="date"
                    value={ data.date ? moment(data.date).utc().format("YYYY-MM-DD") : undefined }
                    min={ data.dataEnd ? moment(data.dataEnd).utc().format("YYYY-MM-DD") : undefined }
                    onChange={ e => onChange({ date: e.target.valueAsDate || undefined }) }
                    required
                />
            </div>
            <div className="col col-1 small middle right nowrap">Site</div>
            <div className="col small">
                <select
                    value={ data.siteId || undefined }
                    onChange={ e => e.target.value && onChange({ siteId: +e.target.value }) }
                >
                    <option value={0}>Please select!</option>
                    { sites.map((site, i) => (
                        <option key={i} value={ site.id }>{ site.name }</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="row half-gap mb-05">
            <div className="col col-2 small middle right nowrap">Data start</div>
            <div className="col col-3 small">
                <input
                    type="date"
                    value={ data.dataStart ? moment(data.dataStart).utc().format("YYYY-MM-DD") : undefined }
                    max={ data.dataEnd ? moment(data.dataEnd).utc().format("YYYY-MM-DD") : undefined }
                    onChange={ e => onChange({ dataStart: e.target.valueAsDate || undefined }) }
                    required
                />
            </div>
            <div className="col col-2 small middle right nowrap">Data end</div>
            <div className="col col-3 small">
                <input
                    type="date"
                    value={ data.dataEnd ? moment(data.dataEnd).utc().format("YYYY-MM-DD") : undefined }
                    min={ data.dataStart ? moment(data.dataStart).utc().format("YYYY-MM-DD") : undefined }
                    onChange={ e => onChange({ dataEnd: e.target.valueAsDate || undefined }) }
                    required
                />
            </div>
        </div>
        <div className="row half-gap">
            <div className="col col-2 small middle right nowrap">Comment</div>
            <div className="col col-6 small">
                <input
                    type="text"
                    placeholder="Optional Comment"
                    value={ data.comment || "" }
                    onChange={ e => onChange({ comment: e.target.value }) }
                />
            </div>
            <div className="col col-2 small middle right nowrap">
                <Checkbox
                    label="Failed"
                    checked={ !!data.failed }
                    name="failed"
                    labelLeft
                    onChange={ failed => onChange({ failed }) }
                />
            </div>
        </div>
        </>
    )
}