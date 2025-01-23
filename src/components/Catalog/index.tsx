import { classList } from "../../utils";
import { Tabs } from "../generic/Tabs";
import json from "./icd10_hierarchy_count.json"
import { useState } from "react";
import StaticGrid from "../generic/StaticGrid";
import "./Catalog.scss";



const MAPPING: DataMapping = {
    id: "id",
    pid: "pid",
    label: "display",
    count: "cnt",
    description: "metadata_description"
}


interface DataRow {
    id: string | number
    pid: string | number | null
    [key: string]: string | number | boolean | null
}

interface DataMapping {
    /** The name of the id property */
    id: string

    /** The name of the pid property */
    pid: string

    /** The name of the count property. If provided render counts in a badge */
    count: string

    /** The name of the label/name property */
    label: string

    /** The name of the description property */
    description: string
}

export default function Catalog() {
    return (
        <div className="catalog">
            <h3 className="mt-0 mb-1 color-blue-dark"><i className="icon fa-solid fa-archive" /> Catalog</h3>
            <Tabs selectedIndex={0}>
            {[
                {
                    name: "Data Tree",
                    children: <Tree data={json} mapping={MAPPING} />
                }, {
                    name: "Data Grid",
                    children: <div className="p-05 pt-1">
                        <StaticGrid
                            columns={[
                                {
                                    name      : MAPPING.label,
                                    label     : "Display",
                                    searchable: true,
                                    type      : "string",
                                },
                                {
                                    name      : MAPPING.count,
                                    label     : "Count",
                                    // searchable: true,
                                    type      : "number",
                                    value(row, c) {
                                        return Number(row[MAPPING.count]).toLocaleString()
                                    },
                                },
                                {
                                    name      : MAPPING.description,
                                    label     : "Description",
                                    searchable: true,
                                    type      : "string",
                                }
                            ]}
                            rows={json}
                            // groupBy={MAPPING.pid}
                            // maxHeight={"calc(100% - 20.22rem)"}
                            // height={"calc(100% - 3.22rem)"} // exclude search-bar height
                        />
                    </div>
                }, {
                    name: "Data Graph",
                    children: <div className="p-05 pt-1">TODO...</div>
                }
            ]}
            </Tabs>
        </div>
    )
}

function Tree({
    data,
    mapping
}: {
    data: DataRow[]
    mapping: DataMapping
})
{
    const { id, pid } = mapping
    return (
        <div className="catalog-tree">
            <div>
                { data.filter(row => row[pid] === null).map((row, i) => (
                    <Row data={data} id={row[id] as  string | number} key={i} mapping={mapping} open />
                )) }
            </div>
        </div>
    )
}

function Row({
    id,
    data,
    mapping,
    open
}: {
    data: DataRow[]
    id: string | number
    mapping: DataMapping
    open?: boolean
}) {
    const [isOpen, setIsOpen] = useState(!!open)
    const { id: idColumn, pid: pidColumn, label, count, description } = mapping
    const node     = data.find(row => row[idColumn] === id)!
    const children = data.filter(row => row[pidColumn] === node[idColumn])
    return (
        <details open={isOpen} onToggle={e => {
            e.stopPropagation()
            // @ts-ignore
            setIsOpen(!!e.target.open)
        }} className={ classList({
            "has-children": children.length > 0
        }) }>
            <summary>
                <label>
                    <span className={ classList({
                        "icon icon-2 material-symbols-rounded": true,
                        "color-blue": children.length === 0,
                        "color-brand-2": children.length > 0
                    })}>{
                        children.length ? "folder_open" : "draft" }
                    </span>
                    <span>
                        <b>{ node[label] } </b>
                        { description && node[description] }
                    </span>
                    { count && <span className="badge">{Number(node[count]).toLocaleString()}</span> }
                </label>
            </summary>
            { isOpen && data.filter(row => row[pidColumn] === node[idColumn]).map((row, i) => (
                <Row data={data} id={row[idColumn] as string | number} key={i} mapping={mapping} />
            ))}
        </details>
    )
}