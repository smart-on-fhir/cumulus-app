import React      from "react"
import { Link }   from "react-router-dom"
import Checkbox   from "../Checkbox";
import { Format } from "../Format"
import Panel      from "../Panel";
import Select     from "../Select"

import "./form.scss";


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

// const RE_URL = /^(http|https):\/\/[^ "]+$/;


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
                <div className="row gap mt-1">
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
            className="mb-1"
        />
    )
}



export default function DataRequestForm({
    saveRequest,
    deleteRequest,
    record = {},
    onChange,
    requestGroups,
    sites,
    working
}: {
    saveRequest: () => void
    deleteRequest?: () => void
    record?: Partial<app.DataRequest>
    onChange: (state: Partial<app.DataRequest>) => void
    requestGroups: app.RequestGroup[]
    sites: app.DataSite[]
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
        groupId,
        refresh = "manually",
        dataURL = "",
        dataSourceType = record.dataURL ? "url" : "file"
    } = record

    let requestedData = record.requestedData || {
        dataSites: [sites[0]] as app.DataListItem[],
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
                
                <div className="col col-6">
                    <div className="row gap middle">
                        <label className="col">Name</label>
                        <span className="col right color-muted small">Up to 100 characters&nbsp;</span>
                    </div>
                    <input
                        type="text"
                        value={ name || "" }
                        onChange={e => onChange({ ...record, name: e.target.value })}
                        name="DataRequestName"
                        placeholder="Data Subscription Name"
                        required
                    />
                    <div className="row gap mt-1">
                        <div className="col middle">
                            <label>Group</label>
                        </div>
                        <div className="col right middle color-blue">
                            <Link to="/groups">
                                Manage Groups <i className="fa-solid fa-up-right-from-square" />
                            </Link>
                        </div>
                    </div>
                    <select value={groupId} onChange={e => onChange({ ...record, groupId: +e.target.value })}>
                        <option>None (GENERAL)</option>
                        {requestGroups.map((g, i) => (
                            <option key={i} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="col">
                    <div className="row gap middle">
                        <label className="col">Description</label>
                        <span className="col right color-muted small">Up to 500 characters</span>
                    </div>
                    <div className="row row-10 stretch">
                        <div className="col stretch">
                            <textarea
                                value={ description || "" }
                                onChange={e => onChange({ ...record, description: e.target.value })}
                                placeholder="Data Subscription Description"
                                style={{ height: "100%" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <label className="row mt-2">Data Source</label>
            <hr />

            <div className="row gap mt-1 baseline">
                
                <div className="col col-2">
                    <Select
                        options={[
                            {
                                value: "file",
                                icon: "fa-regular fa-file color-blue",
                                label: (
                                    <div>
                                        <div>File</div>
                                        <div className="color-muted small">Data is inserted by manually uploading a CSV or TSV file</div>
                                    </div>
                                )
                            },
                            {
                                value: "url",
                                icon: "fa-solid fa-earth-americas color-blue",
                                label: (
                                    <div>
                                        <div>URL</div>
                                        <div className="color-muted small">The application pulls the data from the provided URL</div>
                                    </div>
                                )
                            }
                        ]}
                        value={dataSourceType}
                        onChange={dataSourceType => onChange({ ...record, dataSourceType })}
                    />
                </div>

                {
                    dataSourceType === "file" ?
                        id ?
                            <>
                                <div className="col col-0">
                                    <Link to={`/requests/${id}/import`} className="btn color-blue">Upload Data</Link>
                                </div>
                                <div className="col"/>
                            </> :
                            <div className="col">
                                You can upload data once this data subscription is saved 
                            </div> :
                        null
                }

                { dataSourceType === "url" && <div className="col col-4">
                    <input type="url" placeholder="Data URL" required value={dataURL || ""} onChange={e => {
                        onChange({ ...record, dataURL: e.target.value })
                    }} />
                </div> }
                
                { dataSourceType === "url" && 
                    <div className="col">
                        <Select
                            right
                            placeholder="Please select"
                            value={ refresh }
                            options={[
                                {
                                    value: "manually",
                                    label: <div>
                                        Refresh Manually
                                        <div className="color-muted small">
                                            Refresh on demand by clicking on dedicated
                                            button in the subscription page
                                        </div>
                                    </div>,
                                    icon : "fa-solid fa-user-gear color-blue"
                                },
                                {
                                    value: "yearly",
                                    label: <div>Refresh Yearly<div className="color-muted small">1 year after the last refresh</div></div>,
                                    icon: "/icons/date_3.png"
                                },
                                {
                                    value: "monthly",
                                    label: <div>Refresh Monthly<div className="color-muted small">1 month after the last refresh</div></div>,
                                    icon : "/icons/date_3.png"
                                },
                                {
                                    value: "weekly",
                                    label: <div>Refresh Weekly<div className="color-muted small">7 days after the last refresh</div></div>,
                                    icon : "/icons/date_3.png"
                                },
                                {
                                    value: "daily",
                                    label: <div>Refresh Daily<div className="color-muted small">24 hours after the last refresh</div></div>,
                                    icon : "/icons/date_3.png"
                                }
                            ]}
                            onChange={value => {
                                onChange({ ...record, refresh: value })
                            }}
                        />
                    </div>
                }
            </div>

            <div className="row gap mt-2 mb-2">
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
                    <Panel title="Included Data Sites" menu={[
                        <Link to="/sites">Manage Data Sites</Link>
                    ]}>
                    { sites.map((site, i) => (
                        <DataListItemCheckbox
                            key={i}
                            item={site as app.DataListItem}
                            checked={!!requestedData.dataSites.find(x => x.name === site.name)}
                            onChange={() => toggleDataSite(site as app.DataListItem)}
                        />
                    ))}
                    </Panel>
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
                                        Delete Subscription
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
                        { id ? "Save Changes" : "Create Subscription" }
                    </button>
                </div>
                { !id && <div className="col"/> }
            </div>
            
        </form>
    )
}