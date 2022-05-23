const formData = require("form-data");
const Mailgun  = require("mailgun.js");
const config   = require("./config");

const mailgun = new Mailgun(formData);
const client = mailgun.client({
    username: "api",
    key: config.mailGun.apiKey,
    url: 'https://api.mailgun.net'
});

/**
 * @param {string[]} html
 * @param {string} name 
 * @param {{label?:string, name: string, description?: string}[]} [items] 
 * @returns 
 */
function list(html, name, items) {
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

/**
 * @param { import("../").app.DataRequest } dataRequest
 */
async function sendDataRequest(dataRequest) {
    
    let html = [
        `<h2>New Data Request</h2>`,
        `<h3>${dataRequest.name}</h3>`,
        `<p style="color:#999">${dataRequest.name}</p>`,
        '<hr />'
    ];

    list(html, "Requested data from the following data sites", dataRequest.requestedData?.dataSites);
    list(html, "Requested Demographics"                      , dataRequest.requestedData?.fields.demographics);
    list(html, "Requested Labs"                              , dataRequest.requestedData?.fields.labs);
    list(html, "Requested Diagnoses"                         , dataRequest.requestedData?.fields.diagnoses);
    list(html, "Requested Immunizations"                     , dataRequest.requestedData?.fields.immunizations);
    list(html, "Requested Procedures"                        , dataRequest.requestedData?.fields.procedures);
    list(html, "Requested Medications"                       , dataRequest.requestedData?.fields.medications);
    list(html, "Requested Computable Phenotypes"             , dataRequest.requestedData?.fields.phenotypes);

    return client.messages.create(config.mailGun.domain, {
        from   : config.appEmail,
        to     : config.cumulusAdminEmail,
        subject: "New Request for Cumulus Data",
        html   : html.join("\n")
    })
}

/**
 * @param { object } options
 * @param { object } options.subscription subscription
 * @param { number } options.subscription.id subscription ID
 * @param { string } options.subscription.name subscription name
 * @param { object } options.view view
 * @param { number } options.view.id view ID
 * @param { string } options.view.name view name
 * @param { string } options.type "required" | "preferred" | "optional"
 * @param { string } options.reason
 * @param {{ username: string }} options.user
 * @param {{ name: string, need: string }[]} options.dataElements
 */
async function requestLineLevelData({ subscription, view, user, dataElements, reason, type }) {

    let html = [
        `<h2>New Line-level Data Request</h2>`,
        `<b>From: </b>${user.username}@cumulus<br/>`,
        `<b>To: </b>Subscription Group: MA DPH Subscriptions to the Massachusetts regional cluster<br />`,
        `<br />`,
        `<b>Subscription: </b><a href="https://smart-cumulus.herokuapp.com/requests/${subscription.id}">${subscription.name} (${subscription.id})</a>`,
        `<b>Chart View: </b><a href="https://smart-cumulus.herokuapp.com/views/${view.id}">${view.id} (#${view.id})</a>`,
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


module.exports = {
    sendDataRequest,
    requestLineLevelData
};
