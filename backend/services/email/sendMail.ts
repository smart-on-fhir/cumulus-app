import Mailgun      from "mailgun.js"
import formData     from "form-data"
import config       from "../../config"
import { debug }    from "../logger"


const mailgun = new Mailgun(formData);

const client = mailgun.client({
    username: "api",
    key     : config.mailGun.apiKey,
    url     : "https://api.mailgun.net"
});

export default async function sendEmail(options: { from: string, to: string, subject: string, html: string }) {
    debug("Sending email: %s", JSON.stringify(options, null, 4));
    // istanbul ignore next
    return client.messages.create(config.mailGun.domain, options)
}
