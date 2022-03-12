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


module.exports = {
    sendDataRequest
};
