import { Templates } from '@digidocs/guardian';

export interface EmailOptions {
  clientEmail: string;
  subject: string;
  body?: string;
  templateType: Templates;
  data?: any;
  attachments?: AttachmentOptions[];
}

export interface AttachmentOptions {
  fileName: string
  content: Buffer
  contentType?: string
}

export const queueGroupName = 'nato-service';
