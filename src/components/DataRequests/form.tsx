import React, { useCallback } from "react"
import { Link }               from "react-router-dom"
import { requestGroups }      from "../../backend"
import { useBackend }         from "../../hooks"
import { Format }             from "../Format"

import "./form.scss";

interface Field {

    name: string
    description: string
}

// FieldEditor =================================================================

interface FieldEditorProps {
    field: Field
    namePlaceHolder?: string
    descriptionPlaceHolder?: string
    onChange: (f: Partial<Field>) => void
}

function FieldEditor({ field, namePlaceHolder, descriptionPlaceHolder, onChange }: FieldEditorProps)
{
    return (
        <div className="row">
            <div className="col col-3" style={{ paddingRight: "0.5em" }}>
                <input
                    type="text"
                    placeholder={ namePlaceHolder || "Name or code" }
                    value={ field.name }
                    onChange={ e => onChange({ name: e.target.value }) }
                />
            </div>
            <div className="col">
                <input
                    type="text"
                    placeholder={ descriptionPlaceHolder || "Description" }
                    value={ field.description }
                    onChange={ e => onChange({ description: e.target.value }) }
                />
            </div>
        </div>
    )
}


// FieldEditorList =============================================================

interface FieldEditorListProps {
    label: string
    namePlaceHolder?: string
    descriptionPlaceHolder?: string
    list: Field[]
    onChange: (list: Field[]) => void
}

class FieldEditorList extends React.Component<FieldEditorListProps>
{
    add()
    {
        this.props.onChange([
            ...this.props.list,
            {
                name: "",
                description: ""
            }
        ]);
    }

    remove(index: number)
    {
        const list = [ ...this.props.list ];
        list.splice(index, 1)
        this.props.onChange(list)
    }

    update(index: number, payload: Partial<Field>)
    {
        const list    = [ ...this.props.list ]
        const oldItem = list[index]
        const newItem = { ...oldItem, ...payload }
        list.splice(index, 1, newItem)
        this.props.onChange(list)
    }

    render()
    {
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
                        {/* <div className="col col-3">
                            <input type="text" placeholder="Name" value={ field.name } onChange={e => {
                                this.update(i, { name: e.target.value })
                            }} />
                        </div>
                        <div className="col">
                            <input type="text" placeholder="Description" value={ field.description } onChange={e => {
                                this.update(i, { description: e.target.value })
                            }} />
                        </div> */}
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
interface FieldsEditorState {
    labs         : Field[]
    diagnoses    : Field[]
    immunizations: Field[]
    medications  : Field[]
    procedures   : Field[]
    phenotypes   : Field[]
    age          : boolean
    cdcAgeGroup  : boolean
    race         : boolean
    ethnicity    : boolean
    deceased     : boolean
    zip          : boolean
    gender       : boolean
} 
class FieldsEditor extends React.Component<any, FieldsEditorState>
{
    state: FieldsEditorState = {
        labs         : [],
        diagnoses    : [],
        immunizations: [],
        medications  : [],
        procedures   : [],
        phenotypes   : [],
        age          : false,
        cdcAgeGroup  : false,
        race         : false,
        ethnicity    : false,
        deceased     : false,
        zip          : false,
        gender       : false
    };
    
    render()
    {
        const {
            labs,
            diagnoses,
            immunizations,
            medications,
            procedures,
            phenotypes,
            age,
            cdcAgeGroup,
            race,
            ethnicity,
            deceased,
            zip,
            gender
        } = this.state;

        return (
            <div>
                <br/>
                <FieldEditorList list={ labs          } onChange={ list => this.setState({ labs         : list }) } label="Labs" />
                <FieldEditorList list={ diagnoses     } onChange={ list => this.setState({ diagnoses    : list }) } label="Diagnoses" />
                <FieldEditorList list={ immunizations } onChange={ list => this.setState({ immunizations: list }) } label="Immunizations" />
                <FieldEditorList list={ medications   } onChange={ list => this.setState({ medications  : list }) } label="Medications" />
                <FieldEditorList list={ procedures    } onChange={ list => this.setState({ procedures   : list }) } label="Procedures" />
                <FieldEditorList list={ phenotypes    } onChange={ list => this.setState({ phenotypes   : list }) } label="Computable Phenotypes" />

                <div className="row">
                    <div className="col middle">
                        <label>Demographics</label>
                    </div>
                </div>
                <hr/>
                <div className="row">
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ age } onChange={e => this.setState({ age: e.target.checked })} />
                            Age
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ cdcAgeGroup } onChange={e => this.setState({ cdcAgeGroup: e.target.checked })} />
                            CDC Age Group
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ race } onChange={e => this.setState({ race: e.target.checked })} />
                            Race
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ ethnicity } onChange={e => this.setState({ ethnicity: e.target.checked })} />
                            Ethnicity
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ deceased } onChange={e => this.setState({ deceased: e.target.checked })} />
                            Deceased
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ zip } onChange={e => this.setState({ zip: e.target.checked })} />
                            ZIP Code
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                    <div className="col col-0 col-5">
                        <label className="checkbox-label mt-1">
                            <input type="checkbox" checked={ gender } onChange={e => this.setState({ gender: e.target.checked })} />
                            Gender
                            <div className="checkbox-label-description color-muted">Short description of the field</div>
                        </label>
                    </div>
                </div>
            </div>
        )
    }
}


export default function DataRequestForm({
    saveRequest,
    deleteRequest,
    record = {},
    onChange
}: {
    saveRequest: () => void
    deleteRequest?: () => void
    record?: Partial<app.DataRequest>
    onChange: (state: Partial<app.DataRequest>) => void
})
{
    const {
        loading: loadingRequestGroups,
        error: loadingRequestGroupsError,
        result: availableRequestGroups
    } = useBackend<app.RequestGroup[]>(
        useCallback(
            () => requestGroups.getAll(),
            []
        ),
        true
    );

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
        description = ""
    } = record

    return (
        <form onSubmit={ onSubmit }>
            <div className="row gap color-muted small">
                <div className="col">
                    { loadingRequestGroupsError && <div><b>Error loading request groups:</b> { loadingRequestGroupsError + "" }</div> }
                    { loadingRequestGroups && <div><b>Loading Request Groups...</b></div> }
                </div>
            </div>
            { id && <div className="row color-muted small mt-1">
                <div className="col col-0 nowrap mb-1"><b>Created:</b> <Format value={ createdAt } format="date-time" /></div>
                <div className="col"/>
                <div className="col nowrap mb-1"><b>Updated:</b> <Format value={ updatedAt } format="date-time" /></div>
                <div className="col"/>
                <div className="col col-0 nowrap mb-1"><b>Fetched:</b> <Format value={ completed } format="date-time" /></div>
            </div> }
            <div className="row gap mt-1">
                <div className="col">
                    <label>Name</label>
                    <input type="text" value={ name || "" } onChange={e => onChange({ ...record, name: e.target.value })} />
                    <label className="mt-1">Description</label>
                    <textarea value={ description || "" } onChange={e => onChange({ ...record, description: e.target.value })} />
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
                    <select>
                        {/* <option>None</option> */}
                        {(availableRequestGroups || []).map((g, i) => (
                            <option key={i} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col">
                    <label>Refresh</label>
                    <select>
                        <option>Manually</option>
                        <option disabled>Yearly</option>
                        <option disabled>Monthly</option>
                        <option disabled>Weekly</option>
                        <option disabled>Daily</option>
                    </select>
                </div>
            </div>
            <div className="row gap mt-1 mb-2">
                <div className="col col-6">
                    <h4>Included Fields</h4>
                    <hr/>
                    <FieldsEditor/>
                </div>
                <div className="col col-4 grey-out">
                    <h4>Included Data Sites</h4>
                    <hr/>
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" defaultChecked />
                        Boston Children's Hospital
                        <div className="checkbox-label-description color-muted">Short description of the Boston Children's Hospital data site</div>
                    </label>
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        Massachusetts General Hospital
                        <div className="checkbox-label-description color-muted">Short description of the Massachusetts General Hospital data site</div>
                    </label>
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        RUSH
                        <div className="checkbox-label-description color-muted">Short description of the RUSH data site</div>
                    </label>
                </div>
            </div>

            <hr/>
            <div className="row gap">
                <div className="col col-6">
                    <div className="row gap">
                        { completed && <div className="col mt-1 mb-1">
                            <button className="btn btn-blue grey-out">Export Data</button>
                        </div> }
                        { id && <div className="col mt-1 mb-1">
                            <Link className="btn btn-blue" to={`/requests/${id}/import`}>Import Data</Link>
                        </div> }
                        { deleteRequest &&
                            <div className="col mt-1 mb-1">
                                <button className="btn color-red grey-out" type="button" onClick={deleteRequest}>Delete Request</button>
                            </div>
                        }
                    </div>
                </div>
                <div className="col mt-1 mb-1"></div>
                <div className="col mt-1 mb-1">
                    <button className="btn btn-green" type="submit">{ id ? "Save Changes" : "Create Request" }</button>
                </div>
            </div>
            
        </form>
    )
}