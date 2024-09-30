import moment  from "moment"
import { app } from "../../.."
import config  from "../../config"


export function UserInvitation({
    message = "",
    activationUrl
}: {
    message     ?: string
    activationUrl: string
}) {

    const timeRemaining = moment.duration(config.userInviteExpireAfterHours, "hours").humanize()

    return (
        <>
            <h2>You have been invited</h2>
            <p>
                Please use the following link <b>within {timeRemaining}</b> to
                activate your Cumulus account:
            </p>
            <p>
                <a href={activationUrl} target="_blank">{activationUrl}</a>
            </p>
            { message && <>
                <p>
                    Here is a personal message from the person who invited you
                    to join Cumulus:
                </p>
                <i>{ message.replace(/<.+?>/g, "") }</i>
            </> }
        </>
    );
}

export function ResetPassword({ resetUrl }: { resetUrl: string }) {
    const timeRemaining = moment.duration(config.userResetExpireAfterHours, "hours").humanize()
    return (
        <>
            <h2>Password Change Requested</h2>
            <p>
                A password change has been requested. If you didn't do this you
                can safely ignore this email. Otherwise, please use the
                following link <b>within {timeRemaining}</b> to change your password:
            </p>
            <p><a href={resetUrl} target="_blank">{resetUrl}</a></p>
        </>
    );
}

export function GraphsAccessNotification({
    graphId,
    actions,
    baseUrl,
    message
}: {
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
    const actionsMap = {
        read  : "view the graph in our chart editor",
        update: "make changes to the graph",
        delete: "delete the graph",
        share : "share the graph with others",
        search: "view this graph within lists and search results",
    }

    function generateActionsList(actions: (keyof typeof actionsMap)[]) {
        const list = actions.map(a => actionsMap[a] || a);
        const last = list.pop()
        return list.join(", ") + " and " + last
    }

    return (
        <>
            <h2>The following content has been shared with you:</h2>

            { graphId.length ?
                graphId.map((id, i) => {
                    const href = new URL("/views/" + id, baseUrl).href
                    return <div key={i}>
                        <a href={href} target="_blank">{href}</a>
                    </div>
                }) :
                (() => {
                    const href = new URL("/views/", baseUrl).href
                    return <div>
                        <a href={href} target="_blank">{href}</a>
                    </div>
                })()
            }

            <p>You are allowed to { generateActionsList(actions as any) }.</p>

            { message && <p>
                The user who shared this with you sent you the following
                message:<br/><br/>{ message.replace(/<.*?>/g, "") }.
            </p> }
        </>
    )
}

export function DataRequestNotification({ subscription }: { subscription: app.Subscription }) {
    return (
        <>
            <h2>New Data Request</h2>
            <h3>{ subscription.name }</h3>
            { subscription.description && <p style={{ color: "#999" }}>{ subscription.description }</p> }
            <hr />
            <List name="Requested data from the following data sites" items={ subscription.requestedData?.dataSites } />
            <List name="Requested Demographics"                       items={ subscription.requestedData?.fields.demographics } />
            <List name="Requested Labs"                               items={ subscription.requestedData?.fields.labs } />
            <List name="Requested Diagnoses"                          items={ subscription.requestedData?.fields.diagnoses } />
            <List name="Requested Immunizations"                      items={ subscription.requestedData?.fields.immunizations } />
            <List name="Requested Procedures"                         items={ subscription.requestedData?.fields.procedures } />
            <List name="Requested Medications"                        items={ subscription.requestedData?.fields.medications } />
            <List name="Requested Computable Phenotypes"              items={ subscription.requestedData?.fields.phenotypes } />
        </>
    );
}

function List({ name, items }: { name: string, items?: { label?: string, name: string, description?: string }[] }) {
    if (items && items.length > 0) {
        return (
            <>
                <h3>{ name }</h3>
                <ul>
                    { items.map((x, i) => (
                        <li key={i}>
                            <b>{ x.label || x.name }</b>
                            <span style={{ color: "#999" }}> - { x.description || "No description provided" }</span>
                        </li>
                    )) }
                </ul>
                <br />
            </>
        );
    }
    return null
}

export function LineLevelDataRequest({
    subscription,
    view,
    type,
    reason,
    user,
    dataElements = [],
    baseUrl
}: {
    subscription: any,
    view        : any,
    type        : any,
    reason      : any,
    user        : any,
    dataElements: any[],
    baseUrl     : string
}) {
    const subscriptionUrl = new URL(`/requests/${subscription.id}`, baseUrl)
    const chartUrl = new URL(`/views/${view.id}`, baseUrl)

    return (
        <>
            <h2>New Line-level Data Request</h2>
            <b>From: </b>{ user.username }@cumulus<br/>
            <b>To: </b>Subscription Group: MA DPH Subscriptions to the Massachusetts regional cluster<br />
            <br />
            <p>
                <b>Subscription: </b>
                <a href={ subscriptionUrl.href }>{ subscription.name} ({subscription.id})</a>
            </p>
            <p>
                <b>Chart View: </b>
                <a href={ chartUrl.href }>{ view.name } (#{view.id})</a>
            </p>
            <p>
                <b>Reason for investigation</b><br/>
                { reason }
            </p>
            <p>
                <b>Request Type: </b><br />
                { type }
            </p>
            <List name="Data Elements (required or preferred)" items={ dataElements.map(e => ({ name: e.name, description: e.need })) } />
        </>
    )
}
