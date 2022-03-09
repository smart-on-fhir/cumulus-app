import { useCallback, useEffect, useState } from "react";
import { Helmet, HelmetProvider }           from "react-helmet-async";
import { Link }                             from "react-router-dom";
import { deleteOne, request }               from "../../backend";
import { AlertError }                       from "../Alert";
import Breadcrumbs                          from "../Breadcrumbs";
import Loader                               from "../Loader";
import "./RequestGroups.scss";

interface State {
    records: app.RequestGroup[]
    loading: boolean
    error  : Error | null
}

export default function RequestGroupList()
{
    const [state, setState] = useState<State>({
        records: [],
        loading: true,
        error  : null
    });

    const { records, loading, error } = state;

    useEffect(useCallback(() => {
        setState({ ...state, loading: true });
        request<app.RequestGroup[]>("/api/request-groups").then(
            records => setState({ ...state, loading: false, records }),
            error   => setState({ ...state, loading: false, error   })
        );
    }, []), [])

    async function deleteGroup(id: number) {
        if (window.confirm("If you delete this group, all the requests that " +
            "belong to it will be assigned to a 'GENERAL' group. Are you sure?"))
        {
            setState({ ...state, loading: true });
            deleteOne("request-groups", id).then(
                rec   => setState({ ...state, loading: false, records: state.records.filter(x => x.id !== rec.id) }),
                error => setState({ ...state, loading: false, error })
            )
        }
    }

    return (
        <div className="request-groups-list">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Request Group</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Request Groups" },
            ]} />
            <div className="row gap middle">
                <div className="col">
                    <h4><i className="fa-solid fa-folder" /> Data Request Groups</h4>
                </div>
                <div className="col col-0">
                    <Link to="new" className="btn color-blue">Create Request Group</Link>
                </div>
            </div>
            <hr className="mb-1" />
            <div className="color-muted mb-3">
                Requests can be assigned to certain group. Otherwise they are considered part of the "GENERAL" group.
            </div>
            { loading && <Loader/> }
            { error && <AlertError>{ error + "" }</AlertError> }
            { !loading && !error && records.length > 0 && <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th/>
                    </tr>
                </thead>
                <tbody>
                    {records.map((row, i) => (
                        <tr key={i}>
                            <td>{row.id}</td>
                            <td><b>{row.name}</b></td>
                            <td>{row.description}</td>
                            <td className="small">{row.createdAt}</td>
                            <td className="small">{row.updatedAt}</td>
                            <td className="right">
                                { row.id !== 1 ? <>
                                <Link title="Edit" className="btn small color-brand-2" to={ row.id + "/edit" }><i className="fa-solid fa-pen-to-square" /></Link>
                                &nbsp;
                                <button title="Delete" className="btn small color-red" onClick={() => deleteGroup(row.id)}><i className="fa-solid fa-trash-can" /></button>
                                </> : <div style={{ lineHeight: "1.78em" }}>&nbsp;</div> }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> }
            <br/>
            <br/>
        </div>
    )
}