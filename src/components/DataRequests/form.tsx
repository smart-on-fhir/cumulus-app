import React      from "react"
import { Link }   from "react-router-dom"
import Checkbox from "../Checkbox";
import { Format } from "../Format"
import Select     from "../Select"

import "./form.scss";

const AVAILABLE_DATA_SITES = [
    {
        name: "Boston Children's Hospital",
        description: "Short description of the Boston Children's Hospital data site"
    },
    {
        name: "Massachusetts General Hospital",
        description: "Short description of the Massachusetts General Hospital data site"
    },
    {
        name: "RUSH",
        description: "Short description of the RUSH data site"
    }
];

const AVAILABLE_DEMOGRAPHICS = [
    {
        name: "age",
        label: "Age",
        description: "Short description of the field"
    },
    {
        name: "cdcAgeGroup",
        label: "CDC Age Group",
        description: "Short description of the field"
    },
    {
        name: "race",
        label: "Race",
        description: "Short description of the field"
    },
    {
        name: "ethnicity",
        label: "Ethnicity",
        description: "Short description of the field"
    },
    {
        name: "deceased",
        label: "Deceased",
        description: "Short description of the field"
    },
    {
        name: "zip",
        label: "ZIP Code",
        description: "Short description of the field"
    },
    {
        name: "gender",
        label: "Gender",
        description: "Short description of the field"
    }
];




// FieldEditor =================================================================

function FieldEditor({
    field,
    namePlaceHolder = "Name or code",
    descriptionPlaceHolder = "Description",
    onChange
}: {
    field: app.DataListItem
    namePlaceHolder?: string
    descriptionPlaceHolder?: string
    onChange: (f: Partial<app.DataListItem>) => void
})
{
    return (
        <div className="row">
            <div className="col col-3" style={{ paddingRight: "0.5em" }}>
                <input
                    type="text"
                    placeholder={ namePlaceHolder }
                    value={ field.name }
                    onChange={ e => onChange({ name: e.target.value }) }
                />
            </div>
            <div className="col">
                <input
                    type="text"
                    placeholder={ descriptionPlaceHolder }
                    value={ field.description }
                    onChange={ e => onChange({ description: e.target.value }) }
                />
            </div>
        </div>
    )
}


// FieldEditorList =============================================================

interface FieldEditorListProps {
    label                  : string
    namePlaceHolder       ?: string
    descriptionPlaceHolder?: string
    list                   : app.DataListItem[]
    onChange               : (list: app.DataListItem[]) => void
}

class FieldEditorList extends React.Component<FieldEditorListProps>
{
    add() {
        this.props.onChange([ ...this.props.list, {
            name: "",
            description: ""
        }]);
    }

    remove(index: number) {
        const list = [ ...this.props.list ];
        list.splice(index, 1)
        this.props.onChange(list)
    }

    update(index: number, payload: Partial<app.DataListItem>) {
        const list    = [ ...this.props.list ]
        const oldItem = list[index]
        const newItem = { ...oldItem, ...payload }
        list.splice(index, 1, newItem)
        this.props.onChange(list)
    }

    render() {
        const { label, namePlaceHolder, descriptionPlaceHolder, list } = this.props

        return (
            <div>
                <div className="row">
                    <div className="col middle">
                        <label>{ label } {  list.length > 0 && <b className="badge">{ list.length }</b> }</label>
                    </div>
                    <div className="col col-0 middle">
                        <span className="btn small color-green" onClick={() => this.add()}>Add</span>
                    </div>
                </div>
                <hr/>
                { list.map((field, i) => (
                    <div key={i} className="row half-gap">
                        <div className="col">
                            <FieldEditor
                                field={field}
                                onChange={x => this.update(i, x)}
                                namePlaceHolder={namePlaceHolder}
                                descriptionPlaceHolder={descriptionPlaceHolder}
                            />
                        </div>
                        <div className="col col-0 middle">
                            <span className="btn color-red" onClick={() => this.remove(i)}>
                                <i className="fas fa-trash-alt"/>    
                            </span>    
                        </div>
                    </div>
                ))}
                <div className={ list.length > 0 ? "mb-3" : "mb-2" } />
            </div>
        )
    }
}


// FieldsEditor ================================================================
interface FieldsEditorProps {
    fields: {
        labs         : app.DataListItem[]
        diagnoses    : app.DataListItem[]
        immunizations: app.DataListItem[]
        medications  : app.DataListItem[]
        procedures   : app.DataListItem[]
        phenotypes   : app.DataListItem[]
        demographics : app.DataListItem[]
    },
    onChange: (state: app.RequestedDataFields) => void
}

class FieldsEditor extends React.Component<FieldsEditorProps>
{
    constructor(props: FieldsEditorProps) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(type: keyof app.RequestedDataFields, list: app.DataListItem[]) {
        this.props.onChange({
            ...this.props.fields,
            [type]: list
        })
    }
    
    render()
    {
        const {
            labs,
            diagnoses,
            immunizations,
            medications,
            procedures,
            phenotypes,
            demographics
        } = this.props.fields

        return (
            <div>
                <br/>
                <FieldEditorList list={ labs          } onChange={ list => this.onChange("labs"         , list) } label="Labs" />
                <FieldEditorList list={ diagnoses     } onChange={ list => this.onChange("diagnoses"    , list) } label="Diagnoses" />
                <FieldEditorList list={ immunizations } onChange={ list => this.onChange("immunizations", list) } label="Immunizations" />
                <FieldEditorList list={ medications   } onChange={ list => this.onChange("medications"  , list) } label="Medications" />
                <FieldEditorList list={ procedures    } onChange={ list => this.onChange("procedures"   , list) } label="Procedures" />
                <FieldEditorList list={ phenotypes    } onChange={ list => this.onChange("phenotypes"   , list) } label="Computable Phenotypes" />

                <div className="row">
                    <div className="col middle">
                        <label>Demographics</label>
                    </div>
                </div>
                <hr/>
                <div className="row gap">
                    { AVAILABLE_DEMOGRAPHICS.map((item, i) => (
                        <div key={i} className="col col-0 col-5">
                            <DataListItemCheckbox
                                checked={!!demographics.find(x => x.name === item.name)}
                                item={item}
                                onChange={on => this.onChange(
                                    "demographics",
                                    AVAILABLE_DEMOGRAPHICS.filter(
                                        d => d.name === item.name ?
                                            on :
                                            !!demographics.find(x => x.name === d.name)
                                        )
                                )}
                            />
                        </div>    
                    ))}
                </div>
            </div>
        )
    }
}

function DataListItemCheckbox({ item, checked, onChange }: {
    item    : app.DataListItem
    checked : boolean
    onChange: (checked: boolean) => void
}) {
    return (
        <Checkbox
            checked={checked}
            onChange={onChange}
            name={item.name}
            label={item.label}
            description={item.description}
            className="mt-1"
        />
    )
}



export default function DataRequestForm({
    saveRequest,
    deleteRequest,
    record = {},
    onChange,
    requestGroups,
    working
}: {
    saveRequest: () => void
    deleteRequest?: () => void
    record?: Partial<app.DataRequest>
    onChange: (state: Partial<app.DataRequest>) => void
    requestGroups: app.RequestGroup[]
    working?: "deleting" | "saving"
})
{
    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        saveRequest()
    }

    const {
        id,
        createdAt,
        updatedAt,
        completed,
        name = "",
        description = "",
        groupId = 1
    } = record

    let requestedData = record.requestedData || {
        dataSites: [AVAILABLE_DATA_SITES[0]] as app.DataListItem[],
        fields: {
            labs         : [] as app.DataListItem[],
            diagnoses    : [] as app.DataListItem[],
            immunizations: [] as app.DataListItem[],
            medications  : [] as app.DataListItem[],
            procedures   : [] as app.DataListItem[],
            phenotypes   : [] as app.DataListItem[],
            demographics : [] as app.DataListItem[],
        }
    } as app.RequestedData;

    function toggleDataSite(site: app.DataListItem) {
        const sites = [...requestedData.dataSites];
        const siteIndex = sites.findIndex(x => x.name === site.name)
        if (siteIndex < 0) {
            sites.push(site)
        } else {
            sites.splice(siteIndex, 1)
        }

        onChange({
            ...record,
            requestedData: {
                ...requestedData,
                dataSites: sites
            }
        })
    }

    return (
        <form onSubmit={ onSubmit }>
            { id && <div className="row gap color-muted small mt-1">
                <div className="col mb-1">
                    <b className="nowrap">Created</b> <Format value={ createdAt } format="date-time" />
                </div>
                <div className="col mb-1 center">
                    <b className="nowrap">Updated</b> <Format value={ updatedAt } format="date-time" />
                </div>
                <div className="col mb-1 right">
                    <b className="nowrap">Data Inserted</b> <Format value={ completed } format="date-time" />
                </div>
            </div> }
            <div className="row gap mt-1">
                <div className="col">
                    <div className="row gap middle">
                        <label className="col">Name</label>
                        <span className="col right color-muted small">Up to 100 characters</span>
                    </div>
                    <input
                        type="text"
                        value={ name || "" }
                        onChange={e => onChange({ ...record, name: e.target.value })}
                        name="DataRequestName"
                        placeholder="Data Request Name"
                        required
                    />

                    <div className="row gap middle mt-1">
                        <label className="col">Description</label>
                        <span className="col right color-muted small">Up to 500 characters</span>
                    </div>
                    <textarea
                        value={ description || "" }
                        onChange={e => onChange({ ...record, description: e.target.value })}
                        placeholder="Data Request Description"
                    />
                </div>
            </div>
            <div className="row gap mt-1 mb-2">
                <div className="col col-6">
                    <div className="row gap">
                        <div className="col middle">
                            <label>Group</label>
                        </div>
                        <div className="col right middle color-blue">
                            <Link to="/groups">Manage Groups</Link>
                        </div>
                    </div>
                    <select value={groupId} onChange={e => onChange({ ...record, groupId: +e.target.value })}>
                        {requestGroups.map((g, i) => (
                            <option key={i} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col">
                    <label>Refresh</label>
                    <Select 
                        placeholder="Please select"
                        value={ record.refresh || "manually" }
                        options={[
                            { value: "manually", label: "Manually", icon: "fas fa-envelope" },
                            { value: "yearly"  , label: "Yearly"  , icon: "fas fa-ban", disabled: true },
                            { value: "monthly" , label: "Monthly" , icon: "fas fa-ban", disabled: true },
                            { value: "weekly"  , label: "Weekly"  , icon: "fas fa-ban", disabled: true },
                            { value: "daily"   , label: "Daily"   , icon: "fas fa-ban", disabled: true }
                        ]}
                        onChange={value => {
                            onChange({ ...record, refresh: value })
                        }}
                    />
                </div>
            </div>
            <div className="row gap mt-1 mb-2">
                <div className="col col-6">
                    <h4>Included Fields</h4>
                    <hr/>
                    <FieldsEditor fields={requestedData.fields} onChange={ fields => onChange({
                        ...record,
                        requestedData: {
                            ...requestedData,
                            fields
                        }
                    }) }/>
                </div>
                <div className="col col-4">
                    <h4>Included Data Sites</h4>
                    <hr/>
                    { AVAILABLE_DATA_SITES.map((site, i) => (
                        <DataListItemCheckbox
                            key={i}
                            item={site}
                            checked={!!requestedData.dataSites.find(x => x.name === site.name)}
                            onChange={() => toggleDataSite(site)}
                        />
                    ))}
                </div>
            </div>

            <hr/>

            <div className="row gap">
                { id && <>
                    <div className="col">
                        <div className="row gap">
                            { deleteRequest &&
                                <div className="col mt-1 mb-1">
                                    <button className="btn color-red" type="button" onClick={deleteRequest}>
                                        { working === "deleting" && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                                        Delete Request
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="col"/>
                </> }

                { !id && <div className="col"/> }
                <div className="col mt-1 mb-1">
                    <button className="btn btn-green" type="submit">
                        { working === "saving" && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                        { id ? "Save Changes" : "Create Request" }
                    </button>
                </div>
                { !id && <div className="col"/> }
            </div>
            
        </form>
    )
}