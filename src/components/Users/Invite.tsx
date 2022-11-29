import { useState }          from "react";
import { Link }              from "react-router-dom";
import { request }           from "../../backend";
import Alert, { AlertError } from "../generic/Alert";

export default function Invite()
{
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState<Error|string|null>(null)
    const [ done, setDone ] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
    
        const formData = new FormData(event.currentTarget);
        const email   = formData.get("email") as string;
        const role    = formData.get("role") as string;
        const message = formData.get("message") as string;

        request("/api/users/invite", {
            method: "POST",
            body: JSON.stringify({ email, role, message }),
            headers: { "content-type": "application/json" }
        })
        .then(() => setDone(true))
        .catch(setError)
        .finally(() => setLoading(false))
    }

    if (done) {
        return (
            <div className="container center" style={{ maxWidth: "40rem" }}>
                <br/>
                <Alert color="green"><b>User invited successfully!</b></Alert>
                <br/>
                <br/>
                <div className="center">
                    <Link className="link" to="/users">Manage Users</Link>
                </div>
            </div>
        )
    }

    return (
        <form className="container" style={{ maxWidth: "40rem" }} onSubmit={ handleSubmit }>
            <h4><i className="fa-solid fa-user-plus color-blue-dark" /> Invite User</h4>
            <hr/>
            { error && <AlertError>{ error + "" }</AlertError> }
            <div className="row gap mt-2 mb-1">
                <div className="col">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" required disabled={ loading } />
                    <div className="color-muted small mt-05">
                        An invitation email will be sent to the new user. They
                        will have 24 hours to respond and activate their account.
                    </div>
                </div>
                <div className="col">
                    <label htmlFor="role">Role</label>
                    <select name="role" id="role" disabled={ loading }>
                        <option value="user">user</option>
                        <option value="manager">manager</option>
                        <option value="admin">admin</option>
                    </select>
                    <div className="color-muted small mt-05">
                        In most cases new user should be created without administrative
                        privileges. Note that admin users can change the role of other
                        users.
                    </div>
                </div>
            </div>
            <div className="row gap mb-2">
                <div className="col">
                    <label htmlFor="message">Custom Message</label>
                    <textarea name="message" id="message" rows={8} disabled={ loading } />
                    <div className="color-muted small mt-05">
                        You can include a custom message to the invited user. If you do so,
                        it will be added to the generated invitation email.
                    </div>
                </div>
            </div>
            <hr/>
            <div className="center mt-2">
                <button
                    className="btn btn-blue pl-2 pr-2"
                    style={{ minWidth: "12em" }}
                    disabled={ loading }
                >
                    { loading && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                    Send Invitation
                </button>
            </div>
        </form>
    )
}