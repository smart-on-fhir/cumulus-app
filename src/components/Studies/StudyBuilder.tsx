import { useEffect, useState } from "react"
// import Checkbox                from "../generic/Checkbox"
// import Grid                    from "../generic/Grid"
import { TemplateEditor }      from "./editors"
import { schema }              from "./Schema"
import { downloadBase64File }  from "../../utils"
import "./Study.scss"


export default function StudyBuilder() {

    const [templateId, setTemplateId] = useState(schema.templates[0].id)

    const [variables, setVariables] = useState<Record<string, any>>({})
    // const [dataSites, setDataSites] = useState<string[]>([])

    // const {} = state

    useEffect(() => {
        const template = schema.templates.find(t => t.id === templateId)
        const newVars: Record<string, any> = {}
        template?.variables?.forEach(variable => {
            // const descriptor = schema.parameters[variable.id];
            newVars[variable.id] = variable.defaultValue
        })
        setVariables(newVars)
    }, [templateId])
    

    function onChange(data: Record<string, any>) {
        setVariables({ ...variables, ...data })
    }

    return (
        <div className="container">
            <div className="center mb-2">
                <h1>Create Study</h1>
            </div>
            <div className="study-builder">
                
                <div className="study-builder-main">
                    <div className="row gap">
                        <div className="col col-1"/>
                        <div className="col col-0 middle right">
                            <b>Template:</b>
                        </div>
                        <div className="col col-auto">
                            <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
                                { schema.templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col col-1"/>
                    </div>
                    <TemplateEditor templateId={templateId} state={variables} onChange={onChange} />
                    { NODE_ENV === "development" && <>
                        <h4 className="color-blue-dark center">Review</h4>
                        <hr className="small color-blue" />
                        <pre>{ JSON.stringify(variables, null, 4) }</pre>
                    </>}
                </div>
            </div>
            {/* <div className="flex" style={{ width: "calc(min(100%, 47rem))", margin: "1rem auto" }}>
                <h6 className="center color-blue-dark mt-1">Data Sites</h6>
                <hr />
                <Grid cols="15rem" gap="0 1rem" style={{ margin: "0.5rem auto 1rem", maxWidth: "calc(min(100%, 47rem))" }}>
                    <label>
                        <Checkbox
                            name=""
                            checked={ dataSites.includes("uc_davis") }
                            onChange={on => {
                                if (on) {
                                    setDataSites([...dataSites, "uc_davis"])
                                } else {
                                    setDataSites(dataSites.filter(x => x !== "uc_davis"))
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
                                    setDataSites([...dataSites, "regenstrief_institute"])
                                } else {
                                    setDataSites(dataSites.filter(x => x !== "regenstrief_institute"))
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
                                    setDataSites([...dataSites, "boston_childrens"])
                                } else {
                                    setDataSites(dataSites.filter(x => x !== "boston_childrens"))
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
                                    setDataSites([...dataSites, "washington_university_st_louis"])
                                } else {
                                    setDataSites(dataSites.filter(x => x !== "washington_university_st_louis"))
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
                                    setDataSites([...dataSites, "boston_childrens_rdw"])
                                } else {
                                    setDataSites(dataSites.filter(x => x !== "boston_childrens_rdw"))
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
                                    setDataSites([...dataSites, "washu"])
                                } else {
                                    setDataSites(dataSites.filter(x => x !== "washu"))
                                }
                            }}
                            label="Washington University"
                        />
                    </label>
                </Grid>
            </div> */}
            <div className="center">
                <button
                    className="btn btn-green m-05"
                    style={{ width: "8rem", margin: "2rem auto 1rem" }}
                    type="button"
                    onClick={() => downloadBase64File("application/json", btoa(JSON.stringify(variables, null, 4)), "StudyBuilderConfig.json")}
                >Submit</button>
            </div>
        </div>
    )
}