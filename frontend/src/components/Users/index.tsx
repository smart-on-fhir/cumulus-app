import { Component, useState } from "react";
import { Link }                from "react-router-dom";
import { useAuth }             from "../../auth";
import { request }             from "../../backend";
import { AlertError }          from "../generic/Alert";
import { Format }              from "../Format";
import Loader                  from "../generic/Loader";
import "./Users.scss"

interface State {
    records  : app.ServerResponses.User[]
    loading  : boolean
    error    : Error | null
    selection: app.ServerResponses.User | null
}

export default class Users extends Component<any, State>
{
    constructor(props: any) {
        super(props);
        this.state = {
            records  : [],
            loading  : true,
            error    : null,
            selection: null
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        request<app.ServerResponses.User[]>("/api/users?order=createdAt:desc").then(
            records => {
                this.setState({
                    loading: false,
                    records,
                    selection: this.state.selection ?
                        records.find(r => r.email === this.state.selection!.email) || records[0] :
                        records[0]
                })
            },
            error   => this.setState({ loading: false, error   })
        );
    }

    update(id: number, patch: Partial<app.ServerResponses.User>) {
        this.setState({ loading: true, error: null })
        request<app.ServerResponses.User>("/api/users/" + id, {
            method: "PUT",
            body: JSON.stringify(patch),
            headers: { "content-type": "application/json" }
        })
        .then(
            () => this.fetch(),
            error => this.setState({ error })
        )
        .finally(() => this.setState({ loading: false }));
    }

    delete(id: number) {
        this.setState({ loading: true, error: null })
        request<app.ServerResponses.User>("/api/users/" + id, { method: "DELETE" })
        .then(
            () => {
                const records = this.state.records.filter(u => u.email !== this.state.selection!.email);
                this.setState({ records, selection: records[0], loading: false })
            },
            error => this.setState({ error, loading: false })
        );
    }

    renderResults() {
        const { loading, error, records, selection } = this.state;

        if (loading) {
            return <Loader/>
        }

        if (error) {
            return <AlertError>{ error + "" }</AlertError>
        }

        if (!records.length) {
            return <AlertError>No users found!</AlertError>
        }

        return (
            <>
                <hr/>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Display Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((row, i) => (
                                <tr
                                    key={i}
                                    className={
                                        selection?.email === row.email ?
                                        "selected" :
                                        undefined
                                    }
                                    onClick={() => this.setState({ selection: row })}
                                >
                                    <td className="pr-2"><DisplayName user={ row } /></td>
                                    <td><Email address={ row.email } noLink /></td>
                                    <td><Role user={ row } /></td>
                                    <td><Status user={ row } /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <hr className="mb-1"/>
                <br />
                { selection && <UserEditor
                    user={ selection }
                    onChange={ patch => this.update(selection.id, patch)}
                    onDelete={() => this.delete(selection.id) }
                /> }
            </>
        )
    }

    render()
    {
        return (
            <div className="users-list">
                <div className="row gap middle mb-1">
                    <div className="col">
                        <h4 className="m-0"><i className="icon fa-solid fa-users color-blue-dark" /> Users</h4>
                    </div>
                    <div className="col col-0">
                        <Link to="invite" className="btn btn-virtual">
                            <b className="color-green">
                                <i className="fa-solid fa-user-plus" /> Invite User
                            </b>
                        </Link>
                    </div>
                </div>
                {/* <h4><i className="icon fa-solid fa-users color-blue-dark" /> Users</h4> */}
                {/* <hr/> */}
                { this.renderResults() }
            </div>
        )
    }
}

function UserEditor({
    user,
    onChange,
    onDelete
}: {
    user: app.ServerResponses.User,
    onChange: (patch: Partial<app.ServerResponses.User>) => void
    onDelete: () => void
}) {
    const auth = useAuth()
    const [ editing, setEditing ] = useState(false)
    const [ role, setRole ] = useState(user.role)

    return (
        <div className="row wrap">
            <div className="col col-6 responsive">
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Display name: </b>
                    <div className="col"><DisplayName user={user} /></div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Email: </b>
                    <div className="col"><Email address={ user.email } /></div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Role: </b>
                    <div className="col"><Role user={ user } /></div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Created at: </b>
                    <div className="col"><Format value={ user.createdAt } format="date-time" /></div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Updated at: </b>
                    <div className="col"><Format value={ user.updatedAt } format="date-time" /></div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Status: </b>
                    <div className="col"><Status user={ user } /></div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Invited by: </b>
                    <div className="col">{
                        user.invitedBy ?
                            <Email address={ user.invitedBy } /> :
                            <span className="color-muted">Nobody (system user)</span>
                    }
                    </div>
                </div>
                <div className="row gap mb-05">
                    <b className="col col-4 right color-blue-dark">Last Login: </b>
                    <div className="col">{ user.lastLogin ?
                        <Format value={ user.lastLogin } format="date-time" /> :
                        <span className="color-muted">never</span> }
                    </div>
                </div>
            </div>
            { user.id !== auth.user?.id && (
            <div className="col col-4 center middle responsive">
                <br />
                {
                    editing ?
                    <div className="row bottom" style={{ width: "14em" }}>
                        <div className="col col-6 left mr-05">
                            <label>Role</label>
                            <select value={role} onChange={e => setRole(e.target.value)}>
                                <option value="user">user</option>
                                <option value="manager">manager</option>
                                <option value="admin">admin</option>
                            </select>
                        </div>
                        <div className="col">
                            <button className="btn" onClick={() => onChange({ role })}>Update</button>
                        </div>
                    </div> :
                    <button type="button" style={{ width: "14em" }} className="btn" onClick={() => setEditing(true)}>
                        Change User Role
                    </button>
                }
                <br />
                <br />
                <button type="button" style={{ width: "14em" }} className="btn color-red" onClick={() => {
                    if (window.confirm("Are you sure you want to permanently delete this user account?")) {
                        onDelete()
                    }
                }}>
                    Delete User
                </button>
            </div> )}
        </div>
    )
}

function Status({ user }: { user: app.ServerResponses.User }) {
    if (user.status === "Expired invitation") {
        return <b className="color-red">Expired invitation</b>
    }
    if (user.status === "Pending invitation") {
        return <b className="color-orange">Pending invitation</b>
    }
    return <span>{ user.status }</span>
}

function Role({ user }: { user: app.ServerResponses.User }) {
    if (user.role === "admin") {
        return <span className="color-red">admin</span>
    }
    if (user.role === "manager") {
        return <span className="color-orange">manager</span>
    }
    return <span className="color-green">user</span>
}

function DisplayName({ user }: { user: app.ServerResponses.User }) {
    if (user.name) {
        return <b>{user.name}</b>
    }
    return <span className="color-muted">No display name</span>
}

function Email({ address, noLink }: { address?: string | null, noLink?: boolean }) {
    if (!address) return <span className="color-muted">None</span>
    return noLink ?
        <span className="color-blue">{ address }</span> :
        <a className="link" href={ "mailto:" + address }>{ address }</a>
}
