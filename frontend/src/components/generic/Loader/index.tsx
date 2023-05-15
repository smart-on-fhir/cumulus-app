export default function Loader({ msg = "Loading..." }: { msg?: string }) {
    return (
        <span><i className="fas fa-circle-notch fa-spin"/> {msg}</span>
    )
}