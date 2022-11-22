import { useCallback, useState }  from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Navigate }               from "react-router"
import { request, createOne }     from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import Loader                     from "../Loader"
import DataRequestForm            from "./form"

import "./form.scss";


export default function CreateDataRequestForm()
{
    const [ state, setState ] = useState<Partial<app.DataRequest>>({})
    const [ savedRecord, setSavedRecord ] = useState<app.DataRequest|null>(null)

    // onSubmit create new DataRequest and redirect to its edit page
    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(async () => {
            await createOne("requests", state as app.DataRequest).then(setSavedRecord);
        }, [state])
    );

    // onMount fetch DataRequestGroups
    const {
        loading: loadingRequestGroups,
        error: loadingRequestGroupsError,
        result: data
    } = useBackend<{ groups: app.RequestGroup[], sites: app.DataSite[] }>(
        useCallback(
            () => Promise.all([
                request<app.RequestGroup[]>("/api/request-groups"),
                request<app.DataSite[]>("/api/data-sites")
            ]).then(([groups, sites]) => ({ groups, sites })),
            []
        ),
        true
    );

    function prefillDemoData() {
        setState({
            // groupId: null, // COVID
            name: "Demo Data Subscription",
            description: "This data subscription has been created for demo purposes",
            requestedData: {
                dataSites: [
                    { name: "Boston Children's Hospital", description: "Short description of the Boston Children's Hospital data site" },
                    { name: "Massachusetts General Hospital", description: "Short description of the Massachusetts General Hospital data site" }
                ],
                fields: {
                    demographics: [
                        { name: "gender"     , description: "Short description of the Gender demographics" },
                        { name: "age"        , description: "Short description of the field" },
                        { name: "cdcAgeGroup", description: "Short description of the field" },
                        { name: "race"       , description: "Short description of the field" },
                        { name: "ethnicity"  , description: "Short description of the field" },
                        { name: "deceased"   , description: "Short description of the field" }
                    ],
                    labs: [
                        { name: "COVID-19", description: "COVID-19 PCR Test Results" },
                        { name: "Flu", description: "" }
                    ],
                    immunizations: [
                        { name: "COVID-19 #1", description: "COVID-19 Vaccine - dose 1" },
                        { name: "COVID-19 #2", description: "COVID-19 Vaccine - dose 2" },
                        { name: "COVID-19 #3", description: "COVID-19 Vaccine - booster" }
                    ],
                    medications: [],
                    phenotypes: [],
                    procedures: [],
                    diagnoses: [
                        { name: "COVID-19", description: "Have the patients been diagnosed with COVID" }
                    ]
                }
            }
        })
    }

    if (savedRecord) {
        return <Navigate to={ "/requests/" + savedRecord.id } />
    }

    if (loadingRequestGroups) {
        return <Loader msg="Loading Subscription Groups..." />
    }

    if (loadingRequestGroupsError) {
        return <AlertError><b>Error loading subscription groups:</b> { loadingRequestGroupsError + "" }</AlertError>
    }

    if (!data) {
        return <AlertError><b>Failed loading data</b></AlertError>
    }

    const { groups, sites } = data;

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Create Data Subscription</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Data Subscriptions", href: "/requests" },
                { name: "Create Data Subscription" }
            ]} />
            <h3> <i className="fa-solid fa-wand-magic-sparkles color-muted pull-right" style={{ cursor: "pointer" }} onClick={prefillDemoData} />Create Data Subscription</h3>
            <hr/>
            <div className="row gap color-muted small">
                <div className="col">
                    { savingError && <AlertError><b>Error saving subscription:</b> { savingError + "" }</AlertError> }
                    { saving && <Loader msg="Saving..."/> }
                </div>
            </div>
            <DataRequestForm
                saveRequest={save}
                onChange={setState}
                record={state}
                requestGroups={groups}
                sites={sites}
                working={ saving ? "saving" : undefined }
            />
        </div>
    )
}

