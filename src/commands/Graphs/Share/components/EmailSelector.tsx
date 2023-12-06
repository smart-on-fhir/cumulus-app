import { useState } from "react"
import Grid         from "../../../../components/generic/Grid"
import "./ShareGraphDialog.scss"

const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default function EmailSelector({
    emails,
    selection,
    onChange
}: {
    emails   : string[]
    selection: string[]
    onChange : (selection: string[]) => void
})
{
    const [hasValidEmail, setHasValidEmail] = useState(false)
    const [value, setValue] = useState("")

    return (
        <div>
            <datalist id="user-emails">
                { emails.map((email, i) => <option key={i} value={ email }>{ email }</option>) }
            </datalist>
            <Grid gap="1rem" cols="auto 5em">
                <input
                    type="text"
                    placeholder="User Email"
                    list="user-emails"
                    value={ value }
                    onChange={e => {
                        setValue(e.target.value.toLowerCase())
                        setHasValidEmail(!!e.target.value.trim().match(EMAIL_REGEXP))
                    }}
                />
                <button
                    className="btn btn-brand-2"
                    disabled={!hasValidEmail || selection.includes(value)}
                    onClick={() => {
                        const v = value
                        setValue("")
                        setHasValidEmail(false)
                        onChange([...selection, v])
                    }}
                >Add</button>
            </Grid>
            <div className="removable-items-list">
                { selection.map((email, i) => (
                    <span key={i} className="removable-item">
                        { email }
                        <i className="fa-solid fa-circle-xmark remove-btn" title="Remove" onMouseDown={() => onChange([...selection].filter(x => x !== email))} />
                    </span>
                )) }
            </div>
        </div>
    )
}