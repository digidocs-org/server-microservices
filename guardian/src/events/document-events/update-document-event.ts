import { Subjects } from '..';

export interface UpdateDocumentEvent {
  subject: Subjects.UpdateDocument;
  data: {
    id: string;
    name: string;
    message?: string;
    inOrder?: boolean;
    selfSign?: boolean;
    validTill?: string;
    timeToSign?: string;
  };
}
