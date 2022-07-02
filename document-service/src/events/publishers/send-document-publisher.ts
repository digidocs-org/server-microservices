import { Publisher, SendDocumentEvent, Subjects } from '@digidocs/guardian';

export class SendDocumentPublisher extends Publisher<SendDocumentEvent> {
  subject: Subjects.SendDocument = Subjects.SendDocument;
}
