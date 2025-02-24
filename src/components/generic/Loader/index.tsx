export default function Loader({ msg = "Loading...", style }: { msg?: string, style?: React.CSSProperties }) {
    return (
        <span style={style}><i className="fas fa-circle-notch fa-spin"/>{msg ? " " + msg : ""}</span>
    )
}