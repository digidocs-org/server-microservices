import { Templates } from '@digidocs/guardian';
import { Request, Response } from 'express';
import { SendEmailPublisher } from 'src/events/publishers/send-email-publisher';
import { natsWrapper } from 'src/nats-wrapper';
import ContactUs from 'authorization-service/models/Contact';

const contactUs = async (req: Request, res: Response) => {
    const { userName, userEmail, userQuery, userMobile, subject } = req.body

    const contact = await ContactUs.create({
        userName,
        userEmail,
        userQuery,
        subject,
        userMobile
    })

    new SendEmailPublisher(natsWrapper.client).publish({
        clientEmail: userEmail,
        subject: subject,
        templateType: Templates.GENERAL,
        data: {
            title: 'Thankyou for contacting us!',
            subtitle: `Thankyou ${userName} for reaching out to us, we have registered your query and our team will connect with you shortly`,
        },
    });

    res.send({ success: true })
};

export { contactUs };