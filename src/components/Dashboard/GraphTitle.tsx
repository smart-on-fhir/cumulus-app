import EditInPlace from "../generic/EditInPlace";

export function GraphTitle({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <h2 style={{ margin: "0 0 0.5ex", lineHeight: 1.2 }}>
            <EditInPlace
                required
                maxLength={100}
                text={value}
                onChange={ onChange }
                id="view-name"
            />
        </h2>
    )
}