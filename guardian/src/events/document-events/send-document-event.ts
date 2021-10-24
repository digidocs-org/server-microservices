import { Subjects } from '../subjects';

export interface SendDocumentEvent {
  subject: Subjects.SendDocument;
  data: {
    id: string;
  };
}
