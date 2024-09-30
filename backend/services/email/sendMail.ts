import Mailgun      from "mailgun.js"
import formData     from "form-data"
import { debuglog } from "util"
import config       from "../../config"

const debug = debuglog("app:email");

const mailgun = new Mailgun(formData);

const client = mailgun.client({
    username: "api",
    key     : config.mailGun.apiKey,
    url     : "https://api.mailgun.net"
});

export default async function sendEmail(options: { from: string, to: string, subject: string, html: string }) {
    debug("Sending email:", JSON.stringify(options, null, 4));
    // istanbul ignore next
    return client.messages.create(config.mailGun.domain, options)
}
