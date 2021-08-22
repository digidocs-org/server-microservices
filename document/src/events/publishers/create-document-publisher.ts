import { Publisher, Subjects, CreateDocument } from '@digidocs/guardian'

export class CreateDocumentPublisher extends Publisher<CreateDocument> {
    subject: Subjects.CreateDocument = Subjects.CreateDocument;
}
