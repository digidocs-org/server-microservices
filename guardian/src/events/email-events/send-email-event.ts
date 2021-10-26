import { Subjects } from '../subjects';

export interface SendEmailEvent {
    subject: Subjects.SendEmail;
    data: {
        senderEmail: string;
        clientEmail: string;
        subject: string;
        body?: string;
    };
}