import "./EditInPlace.scss"

export default function EditInPlace({
    text,
    onChange,
    required,
    maxLength
}: {
    text: string,
    onChange: (text: string) => void
    required?: boolean
    maxLength?: number

}) {
    return (
        <div className="edit-in-place"><span>{text}</span><textarea
            value={text}
            onChange={ e => onChange(e.target.value) }
            required={required}
            maxLength={maxLength}
            spellCheck={false}
        /></div>
    )
}