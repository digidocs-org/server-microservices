export interface EmailOptions {
    senderEmail: string;
    clientEmail: string;
    subject: string;
    body?: string;
}

export const queueGroupName = 'email-service'