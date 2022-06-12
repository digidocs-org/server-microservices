import { Templates } from '@digidocs/guardian';

export interface EmailOptions {
  senderEmail: string;
  clientEmail: string;
  subject: string;
  body?: string;
  templateType?: Templates;
  data?: any;
}

export const queueGroupName = 'notification-service';
