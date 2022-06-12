import { Templates } from '../../types';
import { Subjects } from '../subjects';

export interface SendEmailEvent {
  subject: Subjects.SendEmail;
  data: {
    clientEmail: string;
    subject: string;
    body?: string;
    templateType: Templates;
    data?: any;
    attachments?: AttachmentOptions[];
  };
}

interface AttachmentOptions {
  fileName: string
  content: Buffer
  contentType?: string
}