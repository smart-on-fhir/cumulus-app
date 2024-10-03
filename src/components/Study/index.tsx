import { useReducer, useState } from "react"
import Checkbox                 from "../generic/Checkbox"
import Grid                     from "../generic/Grid"
import Alert                    from "../generic/Alert"
import "./Study.scss"


interface State {
    visitStartDate       ?: string
    visitEndDate         ?: string
    includePatientHistory?: boolean
    dataSites            ?: string[]
    patientAgeMin        ?: number
    patientAgeMinUnits   ?: "years" | "months" | "weeks"
    patientAgeMax        ?: number
    patientAgeMaxUnits   ?: "years" | "months" | "weeks"
    clinicalSex          ?: string[]
    encounterClass       ?: string
    encounterType        ?: string
    noteType             ?: string
    minCountVisits       ?: number
    maxCountVisits       ?: number
}

function reducer(state: State, payload: Partial<State>): State {
    return { ...state, ...payload }
}

export default function StudyBuilder() {

    const [state, dispatch] = useReducer<(s: State, p: Partial<State>) => State>(reducer, {})

    const [type, setType] = useState<"sql" | "cfg" | "build">("cfg")

    const {
        visitStartDate,
        visitEndDate,
        includePatientHistory,
        clinicalSex = [],
        patientAgeMin,
        patientAgeMinUnits = "years",
        patientAgeMax,
        patientAgeMaxUnits = "years",
        encounterClass,
        encounterType,
        noteType,
        minCountVisits,
        maxCountVisits,
        dataSites = []
    } = state

    return (
        <>
            <div className="center mb-2">
                <h1>Create Study</h1>
            </div>
            <div className="toolbar" style={{ width: "40rem", margin: "0 auto 2rem" }}>
                <button className={ "btn" + (type === "cfg" ? " active" : "")} onClick={() => setType("cfg")}>
                    <b style={{ opacity: type === "cfg" ? 1 : 0.6 }}>Traditional</b>
                </button>
                <button className={ "btn" + (type === "sql" ? " active" : "")} onClick={() => setType("sql")}>
                    <b style={{ opacity: type === "sql" ? 1 : 0.6 }}>Raw SQL</b>
                </button>
                <button className={ "btn" + (type === "build" ? " active" : "")} onClick={() => setType("build")}>
                    <b style={{ opacity: type === "build" ? 1 : 0.6 }}>Query Builder</b>
                </button>
            </div>
            <div className="study-builder">
                <div className="study-builder-main">
                    { type === "sql" && <>
                        <Alert color="orange" className="mb-1 pl-1 pr-1">
                            <i className="fa-solid fa-warning" /> SQL queries are only available for admin users!
                        </Alert>
                        <textarea rows={10} placeholder="Raw SQL" />
                    </> }
                    { type === "build" && <Alert color="orange" className="p-2">
                        <h5 className="center"><i className="fa-solid fa-pen-ruler" /> The query builder is not implemented yet</h5>
                    </Alert> }
                    { type === "cfg" && <>
                        <h4 className="color-blue-dark center">Study period</h4>
                        <div className="color-muted mb-05 center">
                            Please specify the study period. You have to at least provide the
                            start date of the visits that should be included in this study.
                        </div>
                        <hr className="small color-blue" />
                        <Grid cols="20rem" gap="2rem" className="mt-1 mb-3">
                            <div>
                                <label>
                                    <i className="fa-regular fa-calendar-days color-blue" /> Visit Start Date
                                </label>
                                <input
                                    type="date"
                                    value={visitStartDate || ""}
                                    max={visitEndDate}
                                    onChange={e => dispatch({ visitStartDate: e.target.value })}
                                />
                                <p className="color-muted mb-05 small">
                                    Select the earliest date of visit to be included in the study
                                </p>
                            </div>
                            <div>
                                <label>
                                    <i className="fa-regular fa-calendar-days color-blue" /> Visit End Date
                                </label>
                                <input
                                    type="date"
                                    value={visitEndDate || ""}
                                    min={visitStartDate}
                                    onChange={e => dispatch({ visitEndDate: e.target.value })}
                                />
                                <p className="color-muted mb-05 small">
                                    Select the latest date of visit to be included in the study
                                </p>
                            </div>
                            <div>
                                <label>
                                    <Checkbox
                                        name=""
                                        checked={ !!includePatientHistory }
                                        onChange={on => dispatch({ includePatientHistory: on })}
                                        label={<b>Include patient history</b>}
                                        description="Short description of what this option does and why are we using it..."
                                    />
                                </label>
                            </div>
                        </Grid>
                        
                        <h4 className="color-blue-dark center">Demographics</h4>
                        <hr className="small color-blue" />
                        <Grid cols="20rem" gap="2rem" className="mt-1 mb-3">
                            <div>
                                <label>Min Patient Age <span className="color-muted" style={{ fontWeight: 400 }}>(at visit)</span></label>
                                <div className="row">
                                    <div className="col col-7 pr-05">
                                        <input
                                            type="number"
                                            placeholder="Min age"
                                            value={ patientAgeMin || "" }
                                            onChange={ e => dispatch({ patientAgeMin: e.target.valueAsNumber }) }
                                            min={0}
                                            max={patientAgeMax || 120}
                                        />
                                    </div>
                                    <div className="col col-3">
                                        <select value={patientAgeMinUnits} onChange={e => dispatch({ patientAgeMinUnits: e.target.value as any })}>
                                            <option value="years">years</option>
                                            <option value="months">months</option>
                                            <option value="weeks">weeks</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="color-muted mb-05 small">
                                    The minimal patient age at the time of visit
                                </p>
                            </div>
                            <div>
                                <label>Max Patient Age <span className="color-muted" style={{ fontWeight: 400 }}>(at visit)</span></label>
                                <div className="row">
                                    <div className="col col-7 pr-05">
                                        <input
                                            type="number"
                                            placeholder="Max age"
                                            value={ patientAgeMax || "" }
                                            onChange={ e => dispatch({ patientAgeMax: e.target.valueAsNumber }) }
                                            min={patientAgeMin || 0}
                                            max={120}
                                        />
                                    </div>
                                    <div className="col col-3">
                                        <select value={patientAgeMaxUnits} onChange={e => dispatch({ patientAgeMaxUnits: e.target.value as any })}>
                                            <option value="years">years</option>
                                            <option value="months">months</option>
                                            <option value="weeks">weeks</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="color-muted mb-05 small">
                                    The maximal patient age at the time of visit
                                </p>
                            </div>
                            <div>
                                <label>Clinical sex</label>
                                <div className="row mt-05 gap">
                                    <div className="col col-0">
                                        <Checkbox checked={clinicalSex.includes("male")}   name="" onChange={on => dispatch({ clinicalSex: on ? [...clinicalSex, "male"] : clinicalSex.filter(x => x !== "male")})} label="Male" />
                                    </div>
                                    <div className="col col-0">
                                        <Checkbox checked={clinicalSex.includes("female")} name="" onChange={on => dispatch({ clinicalSex: on ? [...clinicalSex, "female"] : clinicalSex.filter(x => x !== "female")})} label="Female" />
                                    </div>
                                    <div className="col col-0">
                                        <Checkbox checked={clinicalSex.includes("other")}  name="" onChange={on => dispatch({ clinicalSex: on ? [...clinicalSex, "other"] : clinicalSex.filter(x => x !== "other")})} label="Other" />
                                    </div>
                                </div>
                                <p className="color-muted mb-05 small">
                                    This parameter provides guidance on how a recipient should apply settings or reference ranges
                                    that are derived from observable information
                                </p>
                            </div>
                        </Grid>
                        
                        <h4 className="color-blue-dark center">Healthcare Setting</h4>
                        <hr className="small color-blue" />
                        <Grid cols="20rem" gap="2rem" className="mt-1 mb-3">
                            <div>
                                <label>FHIR Encounter.class</label>
                                <div className="row gap">
                                    <div className="col">
                                        <select value={ encounterClass || "" } onChange={ e => dispatch({ encounterClass: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="IMP" title="A patient encounter where a patient is admitted by a hospital or equivalent facility, assigned to a location where patients generally stay at least overnight and provided with room, board, and continuous nursing service.">inpatient encounter</option>
                                            <option value="AMB" title="A comprehensive term for health care provided in a healthcare facility (e.g. a practitioneraTMs office, clinic setting, or hospital) on a nonresident basis. The term ambulatory usually implies that the patient has come to the location and is not assigned to a bed. Sometimes referred to as an outpatient encounter.">ambulatory</option>
                                            <option value="OBSENC" title="An encounter where the patient usually will start in different encounter, such as one in the emergency department (EMER) but then transition to this type of encounter because they require a significant period of treatment and monitoring to determine whether or not their condition warrants an inpatient admission or discharge. In the majority of cases the decision about admission or discharge will occur within a time period determined by local, regional or national regulation, often between 24 and 48 hours.">observation encounter</option>
                                            <option value="EMER" title="A patient encounter that takes place at a dedicated healthcare service delivery location where the patient receives immediate evaluation and treatment, provided until the patient can be discharged or responsibility for the patient's care is transferred elsewhere (for example, the patient could be admitted as an inpatient or transferred to another facility.)">emergency</option>
                                            <option value="VR" title="A patient encounter where the patient and the practitioner(s) are not in the same physical location. Examples include telephone conference, email exchange, robotic surgery, and televideo conference.">virtual</option>
                                            <option value="HH" title="Healthcare encounter that takes place in the residence of the patient or a designee">home health</option>
                                        </select>
                                        <p className="color-muted mb-05 small">Select what class of encounters should be used in your study</p>
                                    </div>
                                    <div className="col-auto">
                                        <select>
                                            <option>and</option>
                                            <option>or</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label>FHIR Encounter.type</label>
                                <div className="row gap">
                                    <div className="col">
                                        <select value={ encounterType || "" } onChange={ e => dispatch({ encounterType: e.target.value })}>
                                            <option value=""></option>
                                            <option value="ADMS">Annual diabetes mellitus screening</option>
                                            <option value="BD/BM-clin">Bone drilling/bone marrow punction in clinic</option>
                                            <option value="CCS60">Infant colon screening - 60 minutes</option>
                                            <option value="OKI">Outpatient Kenacort injection</option>
                                        </select>
                                        <p className="color-muted mb-05 small">Select what type of encounters should be used in your study</p>
                                    </div>
                                    <div className="col-auto">
                                        <select>
                                            <option>and</option>
                                            <option>or</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label>FHIR Note Type</label>
                                <select value={ noteType || "" } onChange={ e => dispatch({ noteType: e.target.value })}>
                                    <option value=""> </option>
                                    <option value="type1">Type 1</option>
                                    <option value="type2">Type 2</option>
                                </select>
                                <p className="color-muted mb-05 small">Select what kind of notes should be used in your study</p>
                            </div>
                        </Grid>

                        <h4 className="color-blue-dark center">Healthcare Utilization</h4>
                        <hr className="small color-blue" />
                        <Grid cols="20rem" gap="2rem" className="mt-1 mb-3">
                            <div>
                                <label>Min count visits</label>
                                <input
                                    className="mt-1"
                                    type="number"
                                    value={ minCountVisits || "" }
                                    onChange={ e => dispatch({ minCountVisits: e.target.valueAsNumber }) }
                                    min={0}
                                />
                                <p className="color-muted mb-05 small">Short description of what this option is...</p>
                            </div>
                            <div>
                                <label>Max count visits</label>
                                <input
                                    type="number"
                                    value={ maxCountVisits || "" }
                                    onChange={ e => dispatch({ maxCountVisits: e.target.valueAsNumber }) }
                                    min={0}
                                />
                                <p className="color-muted mb-05 small">Short description of what this option is...</p>
                            </div>
                            <div/>
                        </Grid>
                        
                        {/* <h4 className="color-blue-dark center">Review</h4>
                        <hr className="small color-blue" />
                        <pre>{ JSON.stringify(state, null, 4) }</pre> */}
                    </> }
                </div>
            </div>
            <div className="flex" style={{ width: "calc(min(100%, 47rem))", margin: "1rem auto" }}>
                <h6 className="center color-blue-dark mt-1">Data Sites</h6>
                <hr />
                <Grid cols="15rem" gap="0 1rem" style={{ margin: "0.5rem auto 1rem", maxWidth: "calc(min(100%, 47rem))" }}>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("uc_davis") }
                            onChange={on => {
                                if (on) {
                                    dispatch({ dataSites: [...dataSites, "uc_davis"] })
                                } else {
                                    dispatch({ dataSites: dataSites.filter(x => x !== "uc_davis") })
                                }
                            }}
                            label="UC Davis"
                        />
                    </label>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("regenstrief_institute") }
                            onChange={on => {
                                if (on) {
                                    dispatch({ dataSites: [...dataSites, "regenstrief_institute"] })
                                } else {
                                    dispatch({ dataSites: dataSites.filter(x => x !== "regenstrief_institute") })
                                }
                            }}
                            label="Regenstrief Institute"
                        />
                    </label>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("boston_childrens") }
                            onChange={on => {
                                if (on) {
                                    dispatch({ dataSites: [...dataSites, "boston_childrens"] })
                                } else {
                                    dispatch({ dataSites: dataSites.filter(x => x !== "boston_childrens") })
                                }
                            }}
                            label="Boston Children's"
                        />
                    </label>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("washington_university_st_louis") }
                            onChange={on => {
                                if (on) {
                                    dispatch({ dataSites: [...dataSites, "washington_university_st_louis"] })
                                } else {
                                    dispatch({ dataSites: dataSites.filter(x => x !== "washington_university_st_louis") })
                                }
                            }}
                            label="WU St. Louis"
                        />
                    </label>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("boston_childrens_rdw") }
                            onChange={on => {
                                if (on) {
                                    dispatch({ dataSites: [...dataSites, "boston_childrens_rdw"] })
                                } else {
                                    dispatch({ dataSites: dataSites.filter(x => x !== "boston_childrens_rdw") })
                                }
                            }}
                            label="Boston Children's RDW"
                        />
                    </label>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("washu") }
                            onChange={on => {
                                if (on) {
                                    dispatch({ dataSites: [...dataSites, "washu"] })
                                } else {
                                    dispatch({ dataSites: dataSites.filter(x => x !== "washu") })
                                }
                            }}
                            label="Washington University"
                        />
                    </label>
                </Grid>
            </div>
            <div className="center">
                <button
                    className="btn btn-green m-05"
                    style={{ width: "8rem", margin: "2rem auto 1rem" }}
                    type="button"
                >Submit</button>
            </div>
        </>
    )
}
