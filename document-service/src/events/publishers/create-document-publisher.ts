import { Publisher, Subjects, CreateDocumentEvent } from '@digidocs/guardian'

export class CreateDocumentPublisher extends Publisher<CreateDocumentEvent> {
    subject: Subjects.CreateDocument = Subjects.CreateDocument;
}
