import { Subjects } from '..';

export interface UpdateDocumentEvent {
  subject: Subjects.UpdateDocument;
  data: {
    id: string;
    name: string;
    message?: string;
    inOrder?: boolean;
    selfSign?: boolean;
    signType?: string;
    validTill?: string;
    timeToSign?: string;
    version: number;
  };
}
