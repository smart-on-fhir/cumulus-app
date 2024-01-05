import { useState }   from "react"
import { Link }       from "react-router-dom"
import { request }    from "../../backend"
import { AlertError } from "../generic/Alert"
import { arePasswordsValid, CreatePassword, validatePasswords } from "./lib"


export default function EndPasswordReset({ code }: { code: string })
{
    const [ loading     , setLoading      ] = useState(false)
    const [ error       , setError        ] = useState<Error|string|null>(null)
    const [ newPassword1, setNewPassword1 ] = useState("")
    const [ newPassword2, setNewPassword2 ] = useState("")
    const [ activated   , setActivated    ] = useState(false)

    let passwordsValid = arePasswordsValid(newPassword1, newPassword2);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        let error = validatePasswords(newPassword1, newPassword2)
        if (error) {
            return setError(error);
        }

        setLoading(true);
        setError(null);

        request("/api/users/update-password", {
            method : "POST",
            headers: { "content-type": "application/json" },
            body   : JSON.stringify({ password: newPassword1, code })
        })
        .then(() => setActivated(true))
        .catch(setError)
        .finally(() => setLoading(false))
    }

    if (activated) {
        return (
            <div className="container" style={{ maxWidth: "45rem" }}>
                <div className="center mb-3">
                    <h1>Welcome to Cumulus!</h1>
                    <p className="color-green">Password changed successfully!</p>
                    <br />
                    <br />
                    <Link to="/login" className="btn btn-blue-dark pl-2 pr-2">Sign in</Link>
                </div>
            </div>
        )
    }

    return (
        <form className="container" style={{ maxWidth: "45rem" }} onSubmit={ submit } autoComplete="off">
            <div className="bg-blue" style={{ border: "1px solid #CDE", padding: "3rem", borderRadius: 5 }}>
                <h4 className="center">Please create a password to activate your account</h4>
                <hr className="mt-1 mb-2"/>
                { error && <AlertError>{ error + "" }</AlertError> }
                <CreatePassword password1={newPassword1} password2={newPassword2} setPassword1={setNewPassword1} setPassword2={setNewPassword2} />
                <div className="center mt-1">
                    <hr className="mb-2"/>
                    <button
                        className={ "btn pl-2 pr-2" + (loading || !passwordsValid ? "" : " btn-blue") }
                        style={{ minWidth: "10em" }}
                        disabled={ loading || !passwordsValid }>
                        { loading && <i className="fas fa-circle-notch fa-spin"/> } Submit
                    </button>
                </div>
            </div>
        </form>
    )
}
