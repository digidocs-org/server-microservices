import { Subjects } from '..';
import { DocumentStatus } from '../..';

export interface UpdateDocumentEvent {
  subject: Subjects.UpdateDocument;
  data: {
    id: string;
    name: string;
    message?: string;
    inOrder?: boolean;
    selfSign?: boolean;
    status?: DocumentStatus;
    sendForSign?: boolean;
    signType?: string;
    validTill?: string;
    timeToSign?: string;
    version: number;
  };
}
