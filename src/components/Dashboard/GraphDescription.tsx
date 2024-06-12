import EditInPlace from "../generic/EditInPlace";


export function GraphDescription({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <div className="color-muted" style={{ margin: "1ex 0 2ex", lineHeight: 1.2 }}>
            <EditInPlace
                maxLength={500}
                text={value || "no description provided"}
                onChange={ onChange }
                id="view-description"
            />
        </div>
    )
}