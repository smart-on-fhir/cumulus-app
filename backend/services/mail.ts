import formData              from "form-data"
import Mailgun               from "mailgun.js"
import moment                from "moment"
import { debuglog }          from "util"
import { app }               from "../.."
import config                from "../config"
import { AppRequest }        from "../types"
import { getRequestBaseURL } from "../lib"


const debug = debuglog("app:email");

const mailgun = new Mailgun(formData);
const client = mailgun.client({
    username: "api",
    key: config.mailGun.apiKey,
    url: 'https://api.mailgun.net'
});

function list(html: string[], name: string, items?: { label?: string, name: string, description?: string }[]) {
    if (items && items.length > 0) {
        html.push(
            `<h3>${name}</h3>`,
            `<ul>${items.map(x => (
                `<li><b>${x.label || x.name}</b><span style="color:#999"> - ${
                    x.description || "No description provided"}</span></li>`
            )).join("\n")}</ul><br/>`
        );
    }
}

export async function sendDataRequest(subscription: app.Subscription) {
    
    let html = [
        `<h2>New Data Request</h2>`,
        `<h3>${subscription.name}</h3>`,
        `<p style="color:#999">${subscription.name}</p>`,
        '<hr />'
    ];

    list(html, "Requested data from the following data sites", subscription.requestedData?.dataSites);
    list(html, "Requested Demographics"                      , subscription.requestedData?.fields.demographics);
    list(html, "Requested Labs"                              , subscription.requestedData?.fields.labs);
    list(html, "Requested Diagnoses"                         , subscription.requestedData?.fields.diagnoses);
    list(html, "Requested Immunizations"                     , subscription.requestedData?.fields.immunizations);
    list(html, "Requested Procedures"                        , subscription.requestedData?.fields.procedures);
    list(html, "Requested Medications"                       , subscription.requestedData?.fields.medications);
    list(html, "Requested Computable Phenotypes"             , subscription.requestedData?.fields.phenotypes);

    return client.messages.create(config.mailGun.domain, {
        from   : config.appEmail,
        to     : config.cumulusAdminEmail,
        subject: "New Request for Cumulus Data",
        html   : html.join("\n")
    })
}

export async function requestLineLevelData(req: AppRequest) {

    const {
        subscription,
        view,
        type,
        reason,
        user,
        dataElements
    } = req.body;

    const baseUrl = getRequestBaseURL(req)
    const subscriptionUrl = new URL(`/requests/${subscription.id}`, baseUrl)
    const chartUrl = new URL(`/views/${view.id}`, baseUrl)

    let html = [
        `<h2>New Line-level Data Request</h2>`,
        `<b>From: </b>${user.username}@cumulus<br/>`,
        `<b>To: </b>Subscription Group: MA DPH Subscriptions to the Massachusetts regional cluster<br />`,
        `<br />`,
        `<b>Subscription: </b><a href="${subscriptionUrl}">${subscription.name} (${subscription.id})</a>`,
        `<b>Chart View: </b><a href="${chartUrl}">${view.name} (#${view.id})</a>`,
        `<br />`,
        `<b>Reason for investigation</b><br/>`,
        reason,
        `<br />`,
        `<b>Request Type: </b>${type}`
    ];

    list(html, "Data Elements (required or preferred)", dataElements.map(e => ({
        name: e.name,
        description: e.need
    })));

    html.push(`<br /><b>Request Type: </b>${type}`);
    html.push(`<br /><br />Regards,<br/>The Cumulus team`);

    return client.messages.create(config.mailGun.domain, {
        from   : config.appEmail,
        to     : config.regionalClusterEmail,
        subject: "New Request for Line-level Data",
        html   : html.join("\n")
    })
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

    const href = new URL("/activate", baseUrl)
    href.searchParams.set("code", code)

    let html = [
        `<h2>You have been invited</h2>`,
        `<p>Please use the following link within the next ${
            moment.duration(config.userInviteExpireAfterHours, "hours").humanize()
        } to activate your Cumulus account:</p>`,
        `<p><a href="${href}" target="_blank">${href}</a></p>`
    ];

    if (message) {
        html.push(
            `<p>Here is a personal message from the person who invited you to join Cumulus:</p>`,
            `<p>${message.replace(/<.+?>/g, "")}</p>`
        )
    }

    html.push(`<br /><br />Regards,<br/>The Cumulus team`)
    
    debug("Sending user invitation email:", JSON.stringify({
        from   : config.appEmail,
        to     : email,
        subject: "Activate your account",
        html   : html.join("\n")
    }, null, 4));

    return client.messages.create(config.mailGun.domain, {
        from   : config.appEmail,
        to     : email,
        subject: "Activate your account",
        html   : html.join("\n")
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

    const href = new URL("/password-reset", baseUrl)
    href.searchParams.set("code", code)

    let html = [
        `<h2>Password Change Requested</h2>`,
        `<p>A password change has been requested. If you didn't do this you can ` +
        `safely ignore this email. Otherwise, please use the following link within ${
            moment.duration(config.userResetExpireAfterHours, "hours").humanize()
        } to change your password:</p>`,
        `<p><a href="${href}" target="_blank">${href}</a></p>`
    ];

    html.push(`<br /><br />Regards,<br/>The Cumulus team`)
    
    debug("Sending password reset email:", JSON.stringify({
        from   : config.appEmail,
        to     : email,
        subject: "Activate your account",
        html   : html.join("\n")
    }, null, 4));

    return client.messages.create(config.mailGun.domain, {
        from   : config.appEmail,
        to     : email,
        subject: "Change your cumulus password",
        html   : html.join("\n")
    })
}

// -----------------------------------------------------------------------------

/**
 * When someone shares a graph with user(s) and includes the optional message,
 * this function will be called to send that message to all recipients
 */
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

    return Promise.allSettled(emails.map(email => {
        let html = [`<h2>The following content has been shared with you:</h2>`];

        if (graphId.length) {
            graphId.forEach(id => {
                const href = new URL("/views/" + id, baseUrl)
                html.push(`<div><a href="${href}" target="_blank">${href}</a></div>`)
            })
        } else {
            const href = new URL("/views/", baseUrl)
            html.push(`<div><a href="${href}" target="_blank">${href}</a></div>`)
        }

        html.push(`<p>You are allowed to ${generateActionsList(actions as any)}.</p>`)

        if (message) {
            html.push(
                `<p>The user who shared this with you sent you the following ` +
                `message:<br/><br/> ${message.replace(/<.*?>/g, "")}.</p>`
            )
        }

        html.push(`<br /><br />Regards,<br/>The Cumulus team`)

        return client.messages.create(config.mailGun.domain, {
            from   : config.appEmail,
            to     : email,
            subject: "New content has been shared with you",
            html   : html.join("\n")
        })
    }))
}

