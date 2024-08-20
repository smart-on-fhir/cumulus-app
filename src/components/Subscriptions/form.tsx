import React              from "react"
import { Link }           from "react-router-dom"
import { Format }         from "../Format"
import Panel              from "../generic/Panel"
import Select             from "../generic/Select"
import TagSelector        from "../Tags/TagSelector"
import CheckboxList       from "../generic/CheckboxList"
import DemographicsEditor from "./DemographicsEditor"
import TransmissionEditor from "./Transmissions/TransmissionEditor"
import EditorList         from "../generic/EditorList"
import MarkdownEditor     from "../generic/MarkdownEditor"
import { useAuth }        from "../../auth"
// import { request }        from "../../backend"
// import LoadableSelect     from "../generic/Select/DatasetSelect"
import { app }            from "../../types"

import "./form.scss";

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
                    value={ field.description || "" }
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
            <div className="field-editor-list">
                <div className="row">
                    <div className="col middle">
                        <label>{ label } {  list.length > 0 && <b className="badge">{ list.length }</b> }</label>
                    </div>
                    <div className="col col-0 middle">
                        <span className="btn small color-green btn-virtual" onClick={() => this.add()}>Add</span>
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
                <DemographicsEditor
                    demographics={demographics}
                    onChange={ demographics => this.onChange("demographics", demographics) }
                />
            </div>
        )
    }
}

export default function SubscriptionForm({
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
    record?: Partial<app.Subscription>
    onChange: (state: Partial<app.Subscription>) => void
    requestGroups: app.RequestGroup[]
    sites: app.DataSite[]
    working?: "deleting" | "saving"
})
{
    const { user } = useAuth();

    const canUpdate = user?.permissions.includes("Subscriptions.update")
    const canDelete = user?.permissions.includes("Subscriptions.delete")

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

    function toggleDataSite(site: app.DataSite) {
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
            <div className="row gap-2 wrap">
                
                <div className="col col-6 mt-1 responsive">
                    <div className="row gap middle">
                        <label className="col">Name</label>
                        <span className="col right color-muted small">Up to 100 characters&nbsp;</span>
                    </div>
                    <input
                        type="text"
                        value={ name || "" }
                        onChange={e => onChange({ ...record, name: e.target.value })}
                        name="SubscriptionName"
                        placeholder="Subscription Name"
                        required
                    />
                    <div className="row gap mt-1">
                        <div className="col middle">
                            <label>Group</label>
                        </div>
                        <div className="col col-0 right middle color-blue small">
                            <Link to="/groups">
                                Manage Groups <i className="fa-solid fa-up-right-from-square" />
                            </Link>
                        </div>
                    </div>
                    <select value={groupId || undefined} onChange={e => onChange({ ...record, groupId: +e.target.value })}>
                        <option>None (GENERAL)</option>
                        {requestGroups.map((g, i) => (
                            <option key={i} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <div className="mt-1">
                        <div className="row gap middle">
                            <div className="col middle">
                                <label className="col">Tags</label>
                            </div>
                            <div className="col col-0 right middle color-blue small">
                                <Link to="/tags">
                                    Manage Tags <i className="fa-solid fa-up-right-from-square" />
                                </Link>
                            </div>
                        </div>
                        <div>
                            <TagSelector selected={record.Tags} onChange={tags => onChange({ ...record, Tags: tags })} />
                        </div>
                    </div>
                </div>
                
                <div className="col col-4 mt-1 mb-0 responsive">
                    <div className="row row-10 stretch">
                        <MarkdownEditor textarea={{
                            value: description || "",
                            onChange: e => onChange({ ...record, description: e.target.value }),
                            className: "form-control description-editor"
                        }}
                        height="10em" />
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
                            },
                            {
                                value: "aggregator",
                                icon: "fa-solid fa-network-wired color-blue",
                                label: (
                                    <div>
                                        <div>Aggregator</div>
                                        <div className="color-muted small">The application pulls the data from the Cumulus Aggregator</div>
                                    </div>
                                )
                            }
                        ]}
                        value={dataSourceType}
                        onChange={dataSourceType => onChange({ ...record, dataSourceType })}
                    />
                    {/* <LoadableSelect onChange={() => {}} load={async () => {
                        // const res = await request("/api/aggregator/subscriptions")
                        const res = await request("/api/aggregator/metadata/general_hospital/core")
                        // console.log(res)
                        const json = JSON.parse(res)
                        return Object.keys(json).map((x: any, i: number) => ({
                            label: x,
                            value: i
                        }))
                    }}/> */}
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
                                You can upload data once this subscription is saved 
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

            <div className="row gap-2 mt-2 wrap">
                <div className="col col-6 mb-2 responsive">
                    <h4>Data Elements</h4>
                    <hr/>
                    <FieldsEditor fields={requestedData.fields} onChange={ fields => onChange({
                        ...record,
                        requestedData: {
                            ...requestedData,
                            fields
                        }
                    }) }/>
                </div>
                <div className="col col-4 mb-2 responsive">
                    <Panel title="Included Healthcare Sites" menu={[
                        <Link to="/sites">Manage Healthcare Sites</Link>
                    ]}>
                        <CheckboxList
                            items={ sites }
                            toggle={ item => toggleDataSite(item as app.DataSite) }
                            isSelected={ item => !!requestedData.dataSites.find(x => x.id === item.id) }
                        />
                    </Panel>

                    <br />
                    <EditorList
                        label="Transmission History"
                        list={ record.transmissions || [] }
                        onAdd={() => ({})}
                        onChange={ transmissions => onChange({ ...record, transmissions }) }
                        editor={ (data, onChange) => (
                            <TransmissionEditor
                                data={ data }
                                onChange={ onChange }
                                sites={ sites }
                            />
                        )}
                    />
                </div>
            </div>

            <hr/>

            <div className="row gap">
                { id && canDelete && <>
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
                { canUpdate && <div className="col mt-1 mb-1">
                    <button className="btn btn-green" type="submit">
                        { working === "saving" && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                        { id ? "Save Changes" : "Create Subscription" }
                    </button>
                </div> }
                { !id && <div className="col"/> }
            </div>
            
        </form>
    )
}