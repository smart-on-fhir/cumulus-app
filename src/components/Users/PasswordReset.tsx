import { useSearchParams }    from "react-router-dom"
import { BeginPasswordReset } from "./BeginPasswordReset"
import EndPasswordReset       from "./EndPasswordReset"


export default function PasswordReset()
{
    const [ params ] = useSearchParams()
    const code = params.get("code") || ""
    if (code) {
        return <EndPasswordReset code={ code } />
    }
    return <BeginPasswordReset />
}
