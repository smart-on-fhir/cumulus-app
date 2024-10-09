import { useCallback, useState } from "react"
import { app }                   from "../../types"
import { humanizeColumnName }    from "../../utils"
import { useBackend }            from "../../hooks"
import { request }               from "../../backend"
import Loader                    from "../generic/Loader"
import { AlertError }            from "../generic/Alert"


export default function ColumnsTable({ cols }: { cols?: app.SubscriptionDataColumn[] })
{
    const {
        loading: loadingLibrary,
        error  : loadingLibraryError,
        result : library
    } = useBackend(
        useCallback(async () => {
            return await request("/cumulus_library_columns.json")
        }, []),
        true
    );

    if (!cols?.length) {
        return <p className="col col-10 color-muted">No data available yet</p>
    }

    if (loadingLibrary) {
        return <Loader msg="Loading columns library..." />
    }

    if (loadingLibraryError) {
        return <AlertError>{ loadingLibraryError + "" }</AlertError>
    }

    return (
        <table className="columns-table">
            <tbody>
                <tr>
                    <th>Variable Name</th>
                    <th>Description</th>
                </tr>
                { cols.map((col, i) => <ColumnsTableItem key={i} col={{
                    meta: library[col.name],
                    ...col
                }}/>) }
            </tbody>
        </table>
    )
}

function ColumnsTableItem({ col }: { col: app.SubscriptionDataColumn })
{
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr>
                <td className="col-name" onClick={() => setOpen(!open)}>
                    <span className="arrow">{ open ? "▿" : "▹" }</span> <img src="/icons/column.png" alt="icon" width="16" style={{ verticalAlign: "middle" }}/> { humanizeColumnName(col.name) }
                </td>
                <td className="col-description">{ col.meta?.display || col.description || "No description provided" }</td>
            </tr>
            { open && <tr>
                <td colSpan={2} className="col-details">
                    { col.meta?.datatype && <div>
                            <label>FHIR Type:</label> { col.meta.datatype }
                        </div>}
                        <div>
                            <label>Data Type:</label> <span className={col.dataType}>
                                { col.dataType }
                            </span>
                        </div>
                        { col.meta?.system && <div>
                            <label>System:</label> { col.meta.system }
                        </div>}
                        { col.meta?.values && <div>
                            <label>Values:</label> <CoddingValuesTable values={col.meta.values} />
                        </div> }
                </td>
            </tr> }
        </>
    )
}

interface CoddingValue {
    code   : string
    display: string
    system?: string
}

function CoddingValuesTable({
    values
}: {
    values: CoddingValue | CoddingValue[]
})
{
    if (!Array.isArray(values)) {
        return <CoddingValueTable value={values} />
    }

    const limit = 10;
    const remainder = Math.max(values.length - limit, 0);
    const rows = remainder ? values.slice(0, limit) : values;
    return (
        <table className="nowrap">
            <tbody>
                <tr className="color-muted">
                    <th>Code</th>
                    <th>Display</th>
                    <th>{ rows.some(v => !!v.system) && "System" }</th>
                </tr>
                { rows.map((x, i) => (
                    <tr key={i}>
                        <td className="color-green nowrap"><b>{ x.code }</b></td>
                        <td>{ x.display }</td>
                        <td>{ x.system && <a href={x.system} target="_blank" rel="noreferrer noopener" className="link">{x.system.split("/").pop()}</a> }</td>
                    </tr>
                )) }
                { remainder > 0 && <tr>
                    <td colSpan={3}>
                        <hr style={{ height: 1 }} />
                        <div className="color-muted">{remainder} more values not shown...</div>
                    </td>
                </tr>}
            </tbody>
        </table>
    )
}

function CoddingValueTable({ value }: { value: CoddingValue })
{
    return (
        <table className="nowrap">
            <tbody>
                <tr className="color-muted">
                    <th>Code</th>
                    <th>Display</th>
                    <th>{ !!value.system && "System" }</th>
                </tr>
                <tr>
                    <td className="color-green nowrap"><b>{ value.code }</b></td>
                    <td>{ value.display }</td>
                    <td>{
                        value.system &&
                        <a href={value.system} target="_blank" rel="noreferrer noopener" className="link">{value.system.split("/").pop()}</a>
                    }</td>
                </tr>
            </tbody>
        </table>
    )
}
