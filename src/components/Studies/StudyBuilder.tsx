import { useEffect, useState } from "react"
import { TemplateEditor }      from "./editors"
import { schema, Template }    from "./Schema"
import { downloadBase64File }  from "../../utils"
import Collapse                from "../generic/Collapse"
import "./Study.scss"


export default function StudyBuilder() {

    const [templateId, setTemplateId] = useState<Template["id"]>(schema.templates[0].id)

    const [variables, setVariables] = useState<Record<string, unknown>>({})

    useEffect(() => {
        const template = schema.templates.find(t => t.id === templateId)
        const newVars: Record<string, unknown> = {}
        template?.variables?.forEach(variable => {
            // const descriptor = schema.parameters[variable.id];
            newVars[variable.id] = variable.defaultValue
        })
        setVariables(newVars)
    }, [templateId])
    

    function onChange(data: Record<string, unknown>) {
        setVariables({ ...variables, ...data })
    }

    return (
        <div className="container">
            <div className="center mb-1">
                <h1>Create Study</h1>
            </div>
            <div className="study-builder">
                <div className="study-builder-main">
                    <div className="row gap mb-3">
                        <div className="col"/>
                        <div className="col col-0 middle right">Template:</div>
                        <div className="col col-0 middle">
                            <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
                                { schema.templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col"/>
                    </div>
                    <TemplateEditor templateId={templateId} state={variables} onChange={onChange} />
                    { NODE_ENV === "development" && <Collapse header={
                        <div className="row middle" style={{ width: "100%" }}>
                            <div className="col col-0 mr-05">
                                <span className="material-symbols-outlined">data_object</span>
                            </div>
                            <div className="col"><b>Dev Preview</b></div>
                        </div>
                    } collapsed>
                        <pre className="pt-1 pb-2 pl-1" style={{ maxHeight: "50vh", overflow: "auto" }}>{ JSON.stringify(variables, null, 4) }</pre>
                    </Collapse>}
                </div>
            </div>
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