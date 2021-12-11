import { Publisher, Subjects, UpdateDocumentEvent } from '@digidocs/guardian';

export class UpdateDocumentPublisher extends Publisher<UpdateDocumentEvent> {
  subject: Subjects.UpdateDocument = Subjects.UpdateDocument;
}
