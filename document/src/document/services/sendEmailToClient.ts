import { SendEmailPublisher } from "src/events/publishers"
import { natsWrapper } from "src/nats-wrapper"
import { IEmailOptions } from "@digidocs/guardian"

export const sendEmailToClient = (data: IEmailOptions) => {
    return new SendEmailPublisher(natsWrapper.client).publish({
        senderEmail: data.senderEmail,
        clientEmail: data.clientEmail,
        subject: data.subject,
        body: data.body
    })
}