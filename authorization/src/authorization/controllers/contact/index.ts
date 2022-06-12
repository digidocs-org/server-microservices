import { Templates } from '@digidocs/guardian';
import { Request, Response } from 'express';
import { SendEmailPublisher } from 'src/events/publishers/send-email-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const contactUs = async (req: Request, res: Response) => {
    const { userName, userEmail, userQueryHeader, userQuery, userMobile } = req.body

    new SendEmailPublisher(natsWrapper.client).publish({
        senderEmail: 'notifications@digidocs.one',
        clientEmail: userEmail,
        subject: userQueryHeader,
        templateType: Templates.GENERAL,
        data: {
            title: 'Thankyou for your query!',
            subtitle: `Thankyou ${userName} for contacting us, our team will connect with you shortly`,
        },
    });
};

export { contactUs };