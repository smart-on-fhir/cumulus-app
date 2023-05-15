import { useEffect, useState }   from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useAuth }    from "../../auth";
import { request }    from "../../backend";
import { AlertError } from "../generic/Alert";

function Check({ condition, label }: { condition: any, label: any }) {
    return condition ?
        <div><i className="fa-solid fa-circle-check color-green" /> { label }</div> :
        <div><i className="fa-solid fa-circle-xmark color-red" /> { label }</div>;
}

export default function Wrap()
{
    const [ params ] = useSearchParams()
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error|string|null>(null);

    const code = params.get("code") || ""

    useEffect(() => {
        request(`/api/users/activate/${code}`)
        .then()
        .catch(setError)
        .finally(() => setLoading(false))
    }, [code]);

    if (loading) {
        return (
            <div className="mt-3 center">
                <i className="fas fa-circle-notch fa-spin"/> Please wait
            </div>
        )
    }

    if (error) {
        return (
            <div className="container pt-2" style={{ maxWidth: "45rem" }}>
                <AlertError>{ error + "" }</AlertError>
            </div>
        )
    }

    return <Activate code={ code } />
}

export function Activate({ code }: { code: string })
{
    const { user } = useAuth()

    const [loading            , setLoading            ] = useState(false);
    const [error              , setError              ] = useState<Error|string|null>(null);
    const [name               , setName               ] = useState(user?.name || "");
    const [newPassword1       , setNewPassword1       ] = useState("");
    const [newPassword2       , setNewPassword2       ] = useState("");
    const [newPassword1Visible, setNewPassword1Visible] = useState(false);
    const [newPassword2Visible, setNewPassword2Visible] = useState(false);
    const [activated          , setActivated          ] = useState(false);

    let passwordsValid = (() => {
        return (
            newPassword1.length >= 8 &&
            newPassword1.match(/[A-Z]/) &&
            newPassword1.match(/[a-z]/) &&
            newPassword1.match(/[0-9]/) &&
            newPassword1.match(/(\$|@|,|#|!|%|~|&|\*|\^)/) &&
            newPassword1 === newPassword2
        );
    })();

    const passwordValidation = (
        <div className="small color-muted">
            <Check key="1" condition={newPassword1.length >= 8} label="At least 8 characters" />
            <Check key="2" condition={newPassword1.match(/[A-Z]/)} label="At least one upper-case letter" />
            <Check key="3" condition={newPassword1.match(/[a-z]/)} label="At least one lower-case letter" />
            <Check key="4" condition={newPassword1.match(/[0-9]/)} label="At least one digit" />
            <Check key="5" condition={newPassword1.match(/(\$|@|,|#|!|%|~|&|\*|\^)/)} label={ <>At least one special character (<b>@</b>,<b>#</b>,<b>!</b>,<b>$</b>,<b>%</b>,<b>~</b>,<b>&amp;</b>,<b>*</b>,<b>^</b>)</>} />
            <Check key="6" condition={newPassword1 === newPassword2} label="Two passwords must match" />
        </div>
    );

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true);
        setError(null);

        request("/api/users/activate", {
            method : "POST",
            headers: { "content-type": "application/json" },
            body   : JSON.stringify({
                newPassword1,
                newPassword2,
                name,
                code
            })
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
                    <p className="color-green">Account activated successfully!</p>
                    <br />
                    <br />
                    <Link to="/login" className="btn btn-blue-dark pl-2 pr-2">Sign in</Link>
                </div>
            </div>
        )
    }


    return (
        <form className="container" style={{ maxWidth: "45rem" }} onSubmit={ submit } autoComplete="off">
            <div className="center mb-3">
                <h1>Welcome to Cumulus!</h1>
                <p>Please create a password and choose a display name in order to activate your account.</p>
            </div>
            <div className="bg-blue" style={{ border: "1px solid #CDE", padding: "3rem", borderRadius: 5 }}>
                { error && <AlertError>{ error + "" }</AlertError> }
                <div className="row gap mb-1">
                    <div className="col">
                        <label htmlFor="role">Display Name</label>
                        <input
                            name="name"
                            id="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Your full name or alias"
                            value={ name }
                            onChange={ e => setName(e.target.value) }
                            disabled={ loading }
                        />
                        <div className="color-muted small mt-05">
                            Choose a name or alias for display purposes. If empty, your email will be used instead.
                        </div>
                    </div>
                </div>
                <div className="row gap mb-1">
                    <div className="col">
                        <label htmlFor="newPassword1">Password * </label>
                        <div className="row">
                            <div className="col">
                                <input
                                    name="newPassword1"
                                    id="newPassword1"
                                    autoComplete="new-password"
                                    type={ newPassword1Visible ? "text" : "password" }
                                    value={newPassword1}
                                    onChange={e => setNewPassword1(e.target.value)}
                                    disabled={ loading }
                                />
                            </div>
                            <div className="col col-0 center middle color-muted pl-05" style={{ flexBasis: "2em" }}>
                                { newPassword1Visible ?
                                <i className="fa-solid fa-eye" title="Click to hide password" onClick={() => setNewPassword1Visible(false)} style={{ cursor: "pointer" }} /> :
                                <i className="fa-solid fa-eye-slash" title="Click to show password" onClick={() => setNewPassword1Visible(true)} style={{ cursor: "pointer" }} /> }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row gap">
                    <div className="col">
                        <label htmlFor="newPassword2">Repeat Password * </label>
                        <div className="row">
                            <div className="col">
                                <input
                                    name="newPassword2"
                                    id="newPassword2"
                                    autoComplete="new-password"
                                    type={ newPassword2Visible ? "text" : "password" }
                                    value={newPassword2}
                                    onChange={e => setNewPassword2(e.target.value)}
                                    disabled={ loading }
                                />
                            </div>
                            <div className="col col-0 center middle color-muted pl-05" style={{ flexBasis: "2em" }}>
                                { newPassword2Visible ?
                                <i className="fa-solid fa-eye" title="Click to hide password" onClick={() => setNewPassword2Visible(false)} style={{ cursor: "pointer" }} /> :
                                <i className="fa-solid fa-eye-slash" title="Click to show password" onClick={() => setNewPassword2Visible(true)} style={{ cursor: "pointer" }} /> }
                            </div>
                        </div>
                        <div className="color-muted small mt-05"></div>
                    </div>
                </div>
                <div className="row gap mb-1">
                    <div className="col">
                        { passwordValidation }
                    </div>
                </div>
                <div className="center mt-1">
                    <hr className="mb-2"/>
                    <button
                        className={ "btn pl-2 pr-2" + (loading || !passwordsValid ? "" : " btn-blue") }
                        style={{ minWidth: "10em" }}
                        disabled={ loading || !passwordsValid }
                    >
                        { loading && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                        Submit
                    </button>
                </div>
            </div>
        </form>
    )
}