import { ReactNode } from "react"
import { useAuth }    from "../../auth"
import { AlertError } from "./Alert"

export default function IfAllowed({
    element,
    permissions,
    showError = true

}: {
    element: ReactNode
    permissions: string | string[]
    showError?: boolean
})
{
    if (!Array.isArray(permissions)) {
        permissions = [permissions];
    }

    const { user } = useAuth()
    const forbidden = permissions.filter(p => !user?.permissions.includes(p))

    if (forbidden.length) {
        return showError ? <AlertError>
            <div>
            You don't have permissions to view this page or to perform this action ({
                forbidden.map((f, i) => (
                    <span key={i}>
                        { i > 0 && ", " }
                        <b>{f}</b>
                    </span>
                ))
            }).
            </div>
        </AlertError> : null;
    }
    
    return element
}