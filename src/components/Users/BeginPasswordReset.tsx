import { useState }   from "react"
import { Link }       from "react-router-dom"
import { request }    from "../../backend"
import { AlertError } from "../generic/Alert"


export function BeginPasswordReset()
{
    const [ loading, setLoading ] = useState(false)
    const [ error  , setError   ] = useState<Error|string|null>(null)
    const [ email  , setEmail   ] = useState("")
    const [ done   , setDone    ] = useState(false)

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true);
        request("/api/users/reset", {
            method : "POST",
            headers: { "content-type": "application/json" },
            body   : JSON.stringify({ email })
        })
        .then(() => { setDone(true); setError(null); })
        .catch(setError)
        .finally(() => setLoading(false))
    }

    if (done) {
        return (
            <div className="container" style={{ maxWidth: "45rem", margin: "auto" }}>
                <div className="center mb-3">
                    <h1>Password reset link sent to {email}</h1>
                    <p className="color-green">Please check your email!</p>
                </div>
            </div>
        )
    }


    return (
        <form className="container" style={{ maxWidth: "45rem", margin: "auto" }} onSubmit={ submit }>
            <div className="bg-blue" style={{ border: "1px solid #CDE", padding: "3rem", borderRadius: 5 }}>
                <h4 className="center">Please enter the email associated with your account</h4>
                <p className="center">A password-reset link will be sent to this email.</p>
                { error && <AlertError>{ error + "" }</AlertError> }
                <div className="row gap mt-2">
                    <div className="col">
                        <input
                            id="email"
                            name="email"
                            autoComplete="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={ loading }
                            type="email"
                            required
                        />
                    </div>
                    <div className="col col-2">
                        <button
                            className={ "btn pl-2 pr-2" + (loading ? "" : " btn-blue") }
                            disabled={ loading }
                            type="submit">
                            { loading && <i className="fas fa-circle-notch fa-spin"/> } Submit
                        </button>
                    </div>
                </div>
                <p className="center mt-2 link bold"><Link to="/login"><i className="fas fa-chevron-left"></i> Back to login</Link></p>
            </div>
        </form>
    )
}
