import "./ColumnEditor.scss"


interface Col {
    name: string
    label: string
    description: string
    dataType: string
}

export function ColumnEditor({
    cols,
    selectedIndex = 0,
    onChange,
    onSelectionChange
}: {
    cols: Col[]
    selectedIndex?: number
    onChange: (cols: Col[]) => void
    onSelectionChange?: (index: number) => void
})
{
    return (
        <div className="data-columns-table">
            <table>
                <thead>
                    <tr>
                        <th>Column <i className="fa fa-info-circle color-muted" data-tooltip="The original column name from the data package or from the uploaded CSV file" /></th>
                        <th>Label <i className="fa fa-info-circle color-muted" data-tooltip="Will be used in chart column labels and titles" /></th>
                        <th>Data Type <i className="fa fa-info-circle color-muted" data-tooltip='<div>Controls how data is parsed and processed and what types of charts it can be used for.<br/><br/><b>WARNING:</b> Changing this can break existing charts!</div>' /></th>
                        <th>Description <i className="fa fa-info-circle color-muted" data-tooltip="Short description of the column in case the label is not descriptive enough" /></th>
                    </tr>
                </thead>
                <tbody>
                    { cols.map((col, i) => (
                        <tr key={i} onClick={() => onSelectionChange?.(i)} className={ selectedIndex === i ? "selected" : undefined}>
                            <td>{col.name}</td>
                            <td className="small">
                                <input type="text" value={col.label} onChange={e => {
                                    col.label = e.target.value
                                    onChange(cols)
                                }} />    
                            </td>
                            <td className="small">
                                <select value={col.dataType} onChange={e => {
                                    col.dataType = e.target.value
                                    onChange(cols)
                                }}>
                                    <option value="integer">Integer</option>
                                    <option value="float">Float</option>
                                    <option value="string">Text</option>
                                    <option value="date:YYYY-MM-DD">Day</option>
                                    <option value="date:YYYY wk W">Week</option>
                                    <option value="date:YYYY-MM">Month</option>
                                    <option value="date:YYYY">Year</option>
                                    <option value="boolean">Boolean</option>
                                    {/* <option value="hidden">Hidden</option>  */}
                                </select>
                            </td>
                            <td className="small">
                                <input type="text" value={col.description} onChange={e => {
                                    col.description = e.target.value
                                    onChange(cols)
                                }} />    
                            </td>
                        </tr>
                    )) }
                </tbody>
            </table>
        </div>
    )
}