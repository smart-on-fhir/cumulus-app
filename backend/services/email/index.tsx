import ReactDOMServer        from "react-dom/server"
import sendEmail             from "./sendMail"
import config                from "../../config"
import { AppRequest }        from "../../types"
import { getRequestBaseURL } from "../../lib/index"
import { app }               from "../../../index"
import {
    DataRequestNotification,
    GraphsAccessNotification,
    LineLevelDataRequest,
    ResetPassword,
    UserInvitation
} from "./components"


function generateHtml(component: JSX.Element): string {
    return `<!DOCTYPE html>
    <html>
        <body style="font:18px sans-serif;margin:0;padding:8px">
            <header>
                <div style="max-width:720px;margin: 0 auto">
                    CUMULUS<sup>®</sub>
                </div>
            </header>
            <div style="margin:0 auto; padding:18px 0;max-width:720px">
                ${ReactDOMServer.renderToStaticMarkup(component)}
            </div>
            <footer style="color:#666;margin:18px 0">
                <div style="border-top:3px solid #EEE;margin:0 auto;padding:18px 0;max-width:720px">
                    Regards,<br/>The Cumulus team
                </div>
            </footer>
        </body>
    </html>`;
}

export async function inviteUser({
    email,
    baseUrl,
    code,
    message = ""
}: {
    /** Recipient email */
    email: string
    baseUrl: string
    /** Activation code */
    code: string
    message?: string
}) {
    const activationUrl = new URL("/activate", baseUrl)
    activationUrl.searchParams.set("code", code)

    return sendEmail({
        from   : config.appEmail,
        to     : email,
        subject: "Activate your account",
        html   : generateHtml(<UserInvitation activationUrl={activationUrl.href} message={message} />)
    })
}

export async function sendResetPasswordEmail({
    email,
    baseUrl,
    code
}: {
    email: string
    baseUrl: string
    code: string
}) {
    const resetUrl = new URL("/password-reset", baseUrl)
    resetUrl.searchParams.set("code", code)
    return sendEmail({
        from   : config.appEmail,
        to     : email,
        subject: "Reset Your Cumulus Password",
        html   : generateHtml(<ResetPassword resetUrl={resetUrl.href} />)
    })
}

export async function notifyForGraphsAccess({
    emails,
    graphId,
    actions,
    baseUrl,
    message
}: {
    /**
     * Users to notify
     */
    emails: string[]

    /**
     * One or more IDs of Graphs that have been shared
     */
    graphId: number[]

    /**
     * One or more actions that have been allowed
     */
    actions: string[]

    baseUrl: string

    message?: string
})
{
    return Promise.allSettled(emails.map(email => {
        return sendEmail({
            from   : config.appEmail,
            to     : email,
            subject: "New content has been shared with you",
            html   : generateHtml(
                <GraphsAccessNotification
                    actions={ actions }
                    baseUrl={ baseUrl }
                    graphId={ graphId }
                    message={ message }
                />
            )
        })
    }))
}

export async function sendDataRequest(subscription: app.Subscription) {
    return sendEmail({
        from   : config.appEmail,
        to     : config.cumulusAdminEmail,
        subject: "New Request for Cumulus Data",
        html   : generateHtml(<DataRequestNotification subscription={ subscription } />)
    })
}

export async function requestLineLevelData(req: AppRequest) {
    const baseUrl = getRequestBaseURL(req)
    return sendEmail({
        from   : config.appEmail,
        to     : config.regionalClusterEmail,
        subject: "New Request for Line-level Data",
        html   : generateHtml(
            <LineLevelDataRequest
                subscription={req.body.subscription}
                view={req.body.view}
                type={req.body.type}
                reason={req.body.reason}
                dataElements={req.body.dataElements}
                baseUrl={baseUrl}
                user={req.user}
            />
        )
    })
}
