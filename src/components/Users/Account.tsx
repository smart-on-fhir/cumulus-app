import { useState }   from "react"
import { useAuth }    from "../../auth"
import { request }    from "../../backend"
import { AlertError } from "../generic/Alert"
import { arePasswordsValid, CreatePassword, validatePasswords } from "./lib"


export default function Account()
{
    const { user, update } = useAuth()
    const [ loading     , setLoading      ] = useState(false)
    const [ error       , setError        ] = useState<Error|string|null>(null)
    const [ changePass  , setChangePass   ] = useState(false)
    const [ password    , setPassword     ] = useState("")
    const [ name        , setName         ] = useState(user?.name || "")
    const [ newPassword1, setNewPassword1 ] = useState("")
    const [ newPassword2, setNewPassword2 ] = useState("")


    async function save(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault()

        const patch: any = {
            password,
            name
        }

        if (changePass) {
            let error = validatePasswords(newPassword1, newPassword2)
            if (error) {
                return setError(error);
            }

            patch.newPassword1 = newPassword1
            patch.newPassword2 = newPassword2
        }

        setLoading(true);
        setError(null);

        request("/api/users/me", {
            method : "PUT",
            body   : JSON.stringify(patch),
            headers: { "content-type": "application/json" }
        })
        .then(user => update(user))
        .catch(setError)
        .finally(() => setLoading(false))
    }

    return (
        <form className="container" style={{ maxWidth: "45rem" }} onSubmit={ save } autoComplete="off">
            <h4><i className="fa-solid fa-user-pen color-blue-dark" /> My Account</h4>
            <hr/>
            { error && <AlertError>{ error + "" }</AlertError> }
            <div className="row gap mt-2">
                <div className="col">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" readOnly defaultValue={ user!.email } autoComplete="email" />
                    <div className="color-muted small mt-05">You are identified by your email. This field cannot be updated!</div>
                </div>
                <div className="col">
                    <label htmlFor="role">Display Name</label>
                    <input name="name" id="name" type="text" autoComplete="name" value={ name } onChange={ e => setName(e.target.value) } />
                    <div className="color-muted small mt-05">Choose a name or alias for display purposes. If empty, your email will be used.</div>
                </div>
            </div>
            <div className="row gap mt-1 mb-2">
                <div className="col">
                    <label htmlFor="password">Current Password *</label>
                    <input name="password" id="password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <div className="color-muted small mt-05">Your current password is required if you want to make any changes to your account</div>
                </div>
            </div>
            <br/>
            <div className="mb-05">
                <label>
                    <input type="checkbox" checked={ changePass } onChange={ e => setChangePass(e.target.checked) }/> Change Password
                </label>
            </div>
            <fieldset className="p-1 mb-3 panel" disabled={ !changePass }>
                <CreatePassword password1={newPassword1} password2={newPassword2} setPassword1={setNewPassword1} setPassword2={setNewPassword2} hideValidation={!changePass} />
            </fieldset>
            <hr/>
            <div className="center mt-2">
                <button
                    className="btn btn-blue pl-2 pr-2"
                    style={{ minWidth: "10em" }}
                    disabled={ loading || !arePasswordsValid(password) }>
                    { loading && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> } Save
                </button>
            </div>
        </form>
    )
}