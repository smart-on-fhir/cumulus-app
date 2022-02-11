import React, { useCallback, useState } from "react"
import { Link }                         from "react-router-dom"
import { requestGroups }                from "../../backend"
import { useBackend }                   from "../../hooks"
import { Format }                       from "../Format"

import "./form.scss";

interface Field {
    name: string
    description: string
}

// interface FieldsState {
//     [name: string]: Field[]
// }

function FieldEditor({
    label
}: {
    label: string
}) {

    const [state, setState] = useState<Field[]>([]);

    function add() {
        setState([ ...state, { name: "", description: ""}])
    }

    function remove(index: number) {
        const nextState = [...state];
        nextState.splice(index, 1)
        setState(nextState)
    }

    return (
        <div>
            <div className="row">
                <div className="col middle">
                    <label>{ label } {  state.length > 0 && <b className="badge">{ state.length }</b> }</label>
                </div>
                <div className="col col-0 middle">
                    <span className="btn small color-green" onClick={ add }>Add</span>
                </div>
            </div>
            <hr/>
            { state.map((field, i) => (
                <div key={i} className="row half-gap">
                    <div className="col col-3">
                        <input type="text" placeholder="Name" value={ field.name } />
                    </div>
                    <div className="col">
                        <input type="text" placeholder="Description" value={ field.description } />
                    </div>
                    <div className="col col-0 middle">
                        <span className="btn color-red" onClick={() => remove(i)}>
                            <i className="fas fa-trash-alt"/>    
                        </span>    
                    </div>
                </div>
            ))}
            <div className={ state.length > 0 ? "mb-3" : "mb-2" } />
        </div>
    )
}

function FieldsEditor()
{
    // const [state, setState] = useState<FieldsState>({
    //     labs: []
    // });

    return (
        <div>
            <br/>
            <FieldEditor label="Labs" />
            <FieldEditor label="Diagnoses" />
            <FieldEditor label="Immunizations" />
            <FieldEditor label="Medications" />
            <FieldEditor label="Procedures" />
            <FieldEditor label="Computable Phenotypes" />

            <div className="row">
                <div className="col middle">
                    <label>Demographics</label>
                </div>
            </div>
            <hr/>
            <div className="row">
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        Age
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        CDC Age Group
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        Race
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        Ethnicity
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        Deceased
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        ZIP Code
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
                <div className="col col-0 col-5">
                    <label className="checkbox-label mt-1">
                        <input type="checkbox" />
                        Gender
                        <div className="checkbox-label-description color-muted">Short description of the field</div>
                    </label>
                </div>
            </div>
        </div>
    )
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
                    <input type="text" value={ name } onChange={e => onChange({ ...record, name: e.target.value })} />
                    <label className="mt-1">Description</label>
                    <textarea value={ description } onChange={e => onChange({ ...record, description: e.target.value })} />
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