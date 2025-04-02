import { FormEvent, useCallback, useState } from "react";
import { useParams, Link }                  from "react-router-dom";
import { useAuth }                          from "../../auth";
import { request }                          from "../../backend";
import { useBackend }                       from "../../hooks";
import Alert, { AlertError }                from "../generic/Alert";
import Breadcrumbs                          from "../generic/Breadcrumbs";
import Checkbox                             from "../generic/Checkbox";
import Loader                               from "../generic/Loader";
import { app }                              from "../../types";
import Terminology                          from "../../Terminology";


type DataElementNeed = "required" | "preferred" | "optional"

interface DataElement {
    name: string
    need: DataElementNeed
}

function DataElementEditor({
    element,
    onChange,
    onRemove
}: {
    element: DataElement
    onChange: (el: DataElement) => void
    onRemove: () => void
}) {
    
    return (
        <div className="row gap mb-1">
            <div className="col">
                <input
                    type="text"
                    value={ element.name }
                    onChange={e => onChange({ ...element, name: e.target.value })}
                    placeholder="Data element name"
                    required
                />
            </div>
            <div className="col col-0">
                <select value={ element.need } onChange={e => {
                    onChange({ ...element, need: e.target.value as DataElementNeed })
                }}>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                    <option value="optional">Optional</option>
                </select>
            </div>
            <div className="col col-0">
                <button className="btn color-red" title="Remove this data element" type="button" onClick={() => onRemove()}>
                    <i className="fas fa-trash-alt"/>    
                </button>    
            </div>
        </div>
    )
}

function DataElementsEditor({
    items,
    onChange
}: {
    items: DataElement[]
    onChange: (items: DataElement[]) => void
}) {

    const updateDataElementAt = (index: number, data: Partial<DataElement>) => {
        const dataElements = [ ...items ];
        Object.assign(dataElements[index], data)
        onChange(dataElements)
    };

    const deleteDataElementAt = (index: number) => {
        const dataElements = [ ...items ];
        dataElements.splice(index, 1)
        onChange(dataElements)
    };

    const addElement = () => {
        onChange([ ...items, { name: "", need: "required" }])
    };

    return (
        <>
            <label>Data Elements</label>
            <div className="color-muted">
                List the data elements you are requesting and
                whether each element is requires or preferred
            </div>
            <hr className="mt-1 mb-1" />
            { items.map((item, i) => (
                <DataElementEditor
                    key={i}
                    element={item}
                    onChange={ el => updateDataElementAt(i, el) }
                    onRemove={ () => deleteDataElementAt(i) }
                />
            )) }

            { items.length > 0 && <hr className="mb-1" /> }
            <div className="center mb-1">
                <button className="btn color-green" onClick={ addElement }>Add Data Element</button>
            </div>
        </>
    )
}

function PriorityEditor({
    value,
    onChange
}: {
    value: string
    onChange: (value: string) => void
}) {
    const list = [
        "Contact tracing",
        "Patient intervention or treatment",
        "Biosurveillance",
        "Research",
        "Existing public health mandated data elements"
    ];

    const elements = [];
    
    list.forEach((item, i) => {
        elements.push(
            <Checkbox
                type="radio"
                name="type"
                checked={ value === item }
                onChange={ () => onChange(item) }
                label={ item }
                key={ i }
            />
        )
    });

    elements.push(
        <Checkbox
            type="radio"
            name="type"
            checked={ !!value && !list.includes(value) }
            onChange={ () => onChange("") }
            label={(
                <input
                    type="text"
                    placeholder="Other - please describe"
                    value={ !value || list.includes(value) ? "" : value }
                    onChange={ e => onChange(e.target.value) }
                />
            )}
            key={ list.length }
        />
    )

    return <>{ elements }</>
}

export default function Preload() {
    const { id } = useParams();

    const { loading, error, result } = useBackend<{subscription: app.Subscription, view: app.View}>(
        useCallback(() => {
            return request("/api/views/" + id).then(view => {
                return request("/api/requests/" + view.subscriptionId).then(subscription => ({
                    subscription,
                    view
                }));
            })},
            [id]
        ),
        true
    );

    if (loading) return <Loader/>
    if (error) return <AlertError>{`Error fetching view with id "${id}": ${error}`}</AlertError>
    if (!result) return <AlertError>{`Error fetching data"`}</AlertError>
    if (!result.view) return <AlertError>{`Error fetching view with id "${id}"`}</AlertError>
    if (!result.subscription) return <AlertError>{`Error fetching ${Terminology.subscription.nameSingular} with id "${result.view.subscriptionId}"`}</AlertError>

    const { view, subscription } = result || {};

    const dataElements = (subscription.metadata?.cols || []).map(col => ({
        name: col.name,
        need: "required"
    })) as DataElement[];

    return <RequestDataForm
        view={ view }
        subscription={ subscription }
        dataElements={ dataElements }
    />
}

export function RequestDataForm({
    view,
    subscription,
    dataElements
}: {
    view: app.View
    subscription: app.Subscription
    dataElements: DataElement[]
})
{
    const auth = useAuth();

    const [loading, setLoading] = useState(false);
    const [sent   , setSent   ] = useState(false);
    const [error  , setError  ] = useState<Error | null>(null);
    
    const [state, setState] = useState({
        dataElements,
        type        : "",
        view        : { id: view.id, name: view.name },
        subscription: { id: subscription.id, name: subscription.name },
        reason      : "",
        user: {
            username: auth.user?.email
        }
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        // console.log(state)
        setLoading(true);
        request(`/api/views/${view.id}/request-linelevel-data`, {
            method : "POST",
            body   : JSON.stringify(state),
            headers: {
                "content-type": "application/json"
            }
        }).then(
            ()  => {
                setLoading(false)
                setSent(true)
            },
            err => {
                setLoading(false);
                setError(err)
            }
        );
    };

    let content: any = null

    if (loading) {
        content = <Loader/>
    }
    else if (error) {
        content = <AlertError>{error.message}</AlertError>
    }
    else if (sent) {
        content = <Alert color="green" icon="fas fa-info-circle">
            <b>Your request has been sent successfully!</b>
            <p>
                <Link className="btn small btn-green" to="/">Go Home</Link> <Link className="btn small btn-green" to={`/views/${view!.id}`}>Go back</Link>
            </p>
        </Alert>
    }
    else {
        content = <>
            <Alert color="blue" icon="fas fa-info-circle">
                <b>Contact information</b>
                <p>
                    The Cumulus committee for your regional cluster will be notified
                    with your line level data request. Your Cumulus email address and
                    contact information will serve as the primary contact. For
                    emergencies, please contact the Cumulus committee directly at
                    617-123-4567. 
                </p>
            </Alert>
            <p className="color-muted mb-2">
                All fields are required!
            </p>
            <form onSubmit={onSubmit}>
                <label htmlFor="reason">Reason for investigation</label>
                <div className="color-muted mb-1">
                    Justify this request the best you can
                </div>
                <textarea
                    id="reason"
                    rows={4}
                    required
                    className="mb-1"
                    value={ state.reason }
                    onChange={ e => setState({ ...state, reason: e.target.value }) }
                />
                <div className="row gap mt-1 mb-1">
                    <div className="col mb-2" style={{ minWidth: "26em", flex: "auto" }}>
                        <label>Request Type</label>
                        <div className="color-muted">
                            Select the request type that best describes your use case
                        </div>
                        <hr className="mt-1 mb-1" />
                        <PriorityEditor value={state.type} onChange={type => setState({ ...state, type })} />
                    </div>
                    <div className="col mb-2" style={{ minWidth: "26em", flex: "auto" }}>
                        <DataElementsEditor
                            items={ state.dataElements }
                            onChange={ dataElements => setState({ ...state, dataElements }) }
                        />
                    </div>
                </div>                
                <hr className="mt-1" />
                <div className="center mt-1 mb-1">
                    <button className="btn btn-blue">Send Request</button>
                </div>
            </form>
        </>
    }

    return (
        <div className="container">
            <title>Request Line-level Data</title>
            <Breadcrumbs links={[
                { name: "Home"  , href: "/" },
                view.isDraft ? { name: "Draft Graphs", href: "/drafts" } : { name: "Graphs", href: "/views"  },
                { name: view!.name, href: (view.isDraft ? "/drafts" : "/views") + `/${view!.id}` },
                { name: "Request Line-level Data" }
            ]}/>
            <h1>Request Line-level Data</h1>
            <hr className="mb-1" />
            { content }
        </div>
    )
}