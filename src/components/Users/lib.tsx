import { useState } from "react";

export function arePasswordsValid(p1: string, p2?: string) {
    return !validatePasswords(p1, p2);
}

export function validatePasswords(p1: string, p2?: string) {
    if (p1.length < 8) {
        return "Passwords must be at least 8 characters long"
    }
    if (!p1.match(/[A-Z]/)) {
        return "Passwords must contain at least one uppercase letter"
    }
    if (!p1.match(/[a-z]/)) {
        return "Passwords must contain at least one lowercase letter"
    }
    if (!p1.match(/[0-9]/)) {
        return "Passwords must contain at least one number"
    }
    if (!p1.match(/(\$|@|,|#|!|%|~|&|\*|\^)/)) {
        return "Passwords must contain at least one special character ($ @ , # ! % ~ & * ^)"
    }
    if (p2 !== undefined && p1 !== p2) {
        return "The two passwords must match"
    }
}

export function CheckMark({ condition, label }: { condition: any, label: any }) {
    return condition ?
        <div><i className="fa-solid fa-circle-check color-green" /> { label }</div> :
        <div><i className="fa-solid fa-circle-xmark color-red" /> { label }</div>;
}

export function PasswordValidation({ password1, password2 }: { password1: string, password2: string }) {
    return <div className="small color-muted mt-05">
        <CheckMark key="1" condition={password1.length >= 8} label="At least 8 characters" />
        <CheckMark key="2" condition={password1.match(/[A-Z]/)} label="At least one upper-case letter" />
        <CheckMark key="3" condition={password1.match(/[a-z]/)} label="At least one lower-case letter" />
        <CheckMark key="4" condition={password1.match(/[0-9]/)} label="At least one digit" />
        <CheckMark key="5" condition={password1.match(/(\$|@|,|#|!|%|~|&|\*|\^)/)} label={ <>At least one special character (<code><b>$ @ , % # ! % ~ &amp; * ^</b></code>)</>} />
        <CheckMark key="6" condition={password1 === password2} label="Two passwords must match" />
    </div>
}

interface PasswordInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: string
    id: string
}

export function PasswordInput(props: PasswordInputProps) {
    const [visible, setVisible] = useState(false)

    const { id, label, ...rest } = props

    return (
        <div className="col">
            <label htmlFor={ id }>{ label }</label>
            <div className="row">
                <div className="col">
                    <input id={id} { ...rest } type={ visible ? "text" : "password" } />
                </div>
                <div className="col col-0 center middle color-muted pl-05" style={{ flexBasis: "2em" }}>
                    { visible ?
                        <i
                            className="fa-solid fa-eye"
                            title="Click to hide password"
                            onClick={() => setVisible(false)}
                            style={{ cursor: "pointer" }}
                        /> :
                        <i
                            className="fa-solid fa-eye-slash"
                            title="Click to show password"
                            onClick={() => setVisible(true)}
                            style={{ cursor: "pointer" }}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export function CreatePassword({
    password1,
    password2,
    setPassword1,
    setPassword2,
    hideValidation
}: {
    password1: string
    password2: string
    setPassword1: (password: string) => void
    setPassword2: (password: string) => void
    hideValidation?: boolean
})
{
    return (
        <>
            <div className="row gap">
                <PasswordInput
                    id="newPassword1"
                    label="New Password *"
                    name="newPassword1"
                    autoComplete="new-password"
                    value={password1}
                    onChange={e => setPassword1(e.target.value)}
                />
                <PasswordInput
                    id="newPassword2"
                    label="Repeat Password *"
                    name="newPassword2"
                    autoComplete="new-password"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                />
            </div>
            { !hideValidation && <div className="row gap mb-1">
                <div className="col">
                    <PasswordValidation password1={password1} password2={password2} />
                </div>
            </div> }
        </>
    )
}
