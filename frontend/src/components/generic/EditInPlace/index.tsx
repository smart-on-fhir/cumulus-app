import "./EditInPlace.scss"

export default function EditInPlace({
    text,
    onChange,
    required,
    maxLength,
    ...rest
}: {
    text: string,
    onChange: (text: string) => void
    required?: boolean
    maxLength?: number
    [key: string]: any

}) {
    return (
        <div className="edit-in-place"><span>{text}</span><textarea
            { ...rest }
            value={text}
            onChange={ e => onChange(e.target.value) }
            required={required}
            maxLength={maxLength}
            spellCheck={false}
        /></div>
    )
}