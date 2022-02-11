import { ChangeEvent, useState } from "react"
import DB from "../../../mocks/views"
import ColumnSelector from "./ColumnSelector"

interface Column {
    name: string
    table: string
    alias?: string
}

export default function GroupByUI({
    usedTables = [],
    current = [],
    onChange = (cols) => {}
}: {
    usedTables?: string[]
    current?: Column[]
    onChange?: (current: Column[]) => void
})
{
    const db = DB.filter(table => usedTables.includes(table.name))

    let [sourceSelection     , setSourceSelection     ] = useState<string[]>([])
    let [destinationSelection, setDestinationSelection] = useState<string[]>([])

    function add() {
        sourceSelection.forEach(col => {
            let [ table, name ] = col.split(".")
            current.push({ table, name })
        });
        setSourceSelection([])
        onChange(current)
    }

    function remove() {
        current = current.filter(col => !destinationSelection.includes(col.table + "." + col.name))
        setDestinationSelection([])
        onChange(current)
    }

    function up() {
        const index = current.findIndex(x => x.table + "." + x.name === destinationSelection[0])
        const item  = current[index]
        current.splice(index, 1)
        current.splice(index - 1, 0, item)
        onChange(current)
    }

    function down() {
        const index = current.findIndex(x => x.table + "." + x.name === destinationSelection[0])
        const item  = current[index]
        current.splice(index, 1)
        current.splice(index + 1, 0, item)
        onChange(current)
    }

    return (
        <div className="mt-1 mb-3">
            <div className="row middle">
                <div className="col color-blue">
                    <label><i className="fas fa-layer-group"/> Group By</label>
                </div>
            </div>
            <hr/>
            <div className="row half-gap mt-1 mb-2">
                <div className="col">
                    <ColumnSelector
                        size={6}
                        multiple
                        db={db}
                        value={ sourceSelection }
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            let options = e.target.selectedOptions, len = options.length;
                            let sel = []
                            for( let i = 0; i < len; i++ ) {
                                let item = options.item(i);
                                if (item) {
                                    sel.push(item.value)
                                }
                            }
                            setSourceSelection(sel)
                        }}
                        filter={(tableName, colName) => !current.find(c => c.table == tableName && c.name == colName)}
                    />
                </div>
                <div className="col col-0 middle">
                    <button className="btn" disabled={ !sourceSelection.length } onClick={add}><i className="fas fa-arrow-right"/></button>
                    &nbsp;
                    <button className="btn" disabled={ !destinationSelection.length } onClick={remove}><i className="fas fa-arrow-left"/></button>
                </div>
                <div className="col">
                    <select
                        size={6}
                        multiple
                        value={ destinationSelection }
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            let options = e.target.selectedOptions, len = options.length;
                            let sel = []
                            for( let i = 0; i < len; i++ ) {
                                let item = options.item(i);
                                if (item) {
                                    sel.push(item.value)
                                }
                            }
                            setDestinationSelection(sel)
                        }}
                    >
                        { current.map((x, i) => (
                            <option key={i} value={x.table + "." + x.name}>{x.table + "." + x.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col col-0 middle">
                    <button
                        className="btn"
                        disabled={!(destinationSelection.length === 1 && current.findIndex(x => x.table + "." + x.name === destinationSelection[0]) > 0)}
                        onClick={up}
                    ><i className="fas fa-arrow-up"/></button>
                    &nbsp;
                    <button
                        className="btn"
                        disabled={!(destinationSelection.length === 1 && current.findIndex(x => x.table + "." + x.name === destinationSelection[0]) < current.length - 1)}
                        onClick={down}
                    ><i className="fas fa-arrow-down"/></button>
                </div>
            </div>
        </div>
    )
}
