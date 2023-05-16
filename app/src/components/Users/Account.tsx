import { useEffect, useRef, useState } from "react";
import { useAuth }    from "../../auth";
import { request }    from "../../backend";
import { AlertError } from "../generic/Alert";

export default function Account()
{
    const { user, update } = useAuth()
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState<Error|string|null>(null)
    const [ changePass, setChangePass ] = useState(false)
    const submitButton = useRef<HTMLButtonElement>(null)
    const [password    , setPassword    ] = useState("")
    // const [email       , setEmail       ] = useState("")
    const [name        , setName        ] = useState(user?.name || "")
    const [newPassword1, setNewPassword1] = useState("")
    const [newPassword2, setNewPassword2] = useState("")
    const [newPassword1Visible, setNewPassword1Visible] = useState(false)
    const [newPassword2Visible, setNewPassword2Visible] = useState(false)

    let passwordsValid = true

    useEffect(() => {
        if (submitButton.current) {
            submitButton.current.disabled = loading || (changePass && !passwordsValid)
        }
    }, [ loading, changePass, passwordsValid, newPassword1, newPassword2])

    function Check({ condition, label }: { condition: any, label: any }) {
        if (!(condition)) {
            passwordsValid = false
            return <div><i className="fa-solid fa-circle-xmark color-red" /> { label }</div>
        }
        return <div><i className="fa-solid fa-circle-check color-green" /> { label }</div>
    }

    const passwordValidation = (
        <div className="small color-muted">
            <Check key="1" condition={newPassword1.length >= 8} label="At least 8 characters" />
            <Check key="2" condition={newPassword1.match(/[A-Z]/)} label="At least one upper-case letter" />
            <Check key="3" condition={newPassword1.match(/[a-z]/)} label="At least one lower-case letter" />
            <Check key="4" condition={newPassword1.match(/[0-9]/)} label="At least one digit" />
            <Check key="5" condition={newPassword1.match(/(\$|@|,|#|!|%|~|&|\*|\^)/)} label={ <>At least one special character (<code><b>@</b>,<b>#</b>,<b>!</b>,<b>$</b>,<b>%</b>,<b>~</b>,<b>&amp;</b>,<b>*</b>,<b>^</b></code>)</>} />
            <Check key="6" condition={newPassword1 === newPassword2} label="Two passwords must match" />
        </div>
    );

    async function save(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault()

        const patch: any = {
            password,
            name
        }

        if (changePass) {
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

    // if (done) {
    //     return (
    //         <div className="container center" style={{ maxWidth: "40rem" }}>
    //             <br/>
    //             <Alert color="green"><b>User invited successfully!</b></Alert>
    //             <br/>
    //             <br/>
    //             <div className="center">
    //                 <Link className="link" to="/users">Manage Users</Link>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <form className="container" style={{ maxWidth: "45rem" }} onSubmit={ save } autoComplete="off">
            <h4><i className="fa-solid fa-user-pen color-blue-dark" /> My Account</h4>
            <hr/>
            { error && <AlertError>{ error + "" }</AlertError> }
            <div className="row gap mt-2">
                <div className="col">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" readOnly defaultValue={ user!.email } autoComplete="email" />
                    <div className="color-muted small mt-05">
                        You are identified by your email. This field cannot be updated!
                    </div>
                </div>
                <div className="col">
                    <label htmlFor="role">Display Name</label>
                    <input name="name" id="name" type="text" autoComplete="name" value={ name } onChange={ e => setName(e.target.value) } />
                    <div className="color-muted small mt-05">
                        Choose a name or alias for display purposes. If empty, your email will be used.
                    </div>
                </div>
            </div>
            <div className="row gap mt-1 mb-2">
                <div className="col">
                    <label htmlFor="password">Current Password</label>
                    <input name="password" id="password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <div className="color-muted small mt-05">
                        Your current password is required if you want to make any changes to your account
                    </div>
                </div>
            </div>
            <br/>
            <div className="mb-05">
                <label>
                    <input type="checkbox" checked={ changePass } onChange={ e => setChangePass(e.target.checked) }/> Change Password
                </label>
            </div>
            <fieldset className="p-1 mb-3" style={{ border: "1px solid #DDD", borderRadius: 4, background: "#e8e8e8" }} disabled={ !changePass }>
                <div className="row gap">
                    <div className="col">
                        <div className="row">
                            <div className="col col-0">
                                <label htmlFor="newPassword1">
                                    New Password
                                </label>
                            </div>
                            <div className="col bottom right mb-05 pr-05 color-muted">
                                { newPassword1Visible ?
                                    <i className="fa-solid fa-eye" title="Click to hide password" onClick={() => setNewPassword1Visible(false)} /> :
                                    <i className="fa-solid fa-eye-slash" title="Click to show password" onClick={() => setNewPassword1Visible(true)} />
                                }
                            </div>
                        </div>
                        <input
                            name="newPassword1"
                            id="newPassword1"
                            autoComplete="new-password"
                            type={ newPassword1Visible ? "text" : "password" }
                            value={newPassword1}
                            onChange={e => setNewPassword1(e.target.value)}
                        />
                        <div className="color-muted small mt-05"></div>
                    </div>
                    <div className="col">
                    <div className="row">
                            <div className="col col-0">
                                <label htmlFor="newPassword2">
                                    Repeat Password
                                </label>
                            </div>
                            <div className="col bottom right mb-05 pr-05 color-muted">
                            { newPassword2Visible ?
                                <i className="fa-solid fa-eye" title="Click to hide password" onClick={() => setNewPassword2Visible(false)} /> :
                                <i className="fa-solid fa-eye-slash" title="Click to show password" onClick={() => setNewPassword2Visible(true)} />
                            }
                            </div>
                        </div>
                        <input
                            name="newPassword2"
                            id="newPassword2"
                            autoComplete="new-password"
                            type={ newPassword2Visible ? "text" : "password" }
                            value={newPassword2}
                            onChange={e => setNewPassword2(e.target.value)}
                        />
                        <div className="color-muted small mt-05"></div>
                    </div>
                </div>
                { changePass && passwordValidation }
            </fieldset>
            <hr/>
            <div className="center mt-2">
                <button
                    className="btn btn-blue pl-2 pr-2"
                    style={{ minWidth: "10em" }}
                    // disabled={ loading || (changePass && !passwordsValid) }
                    ref={submitButton}
                >
                    { loading && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                    Save
                </button>
            </div>
        </form>
    )
}