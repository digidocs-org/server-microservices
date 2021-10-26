import {
  DocumentStatus,
  Listener,
  SendDocumentEvent,
  Subjects,
} from '@digidocs/guardian';
import Document from 'document-service/models/document';
import { queueGroupName } from 'document-service/types';
import { Message } from 'node-nats-streaming';

export default class SendDocumentListener extends Listener<SendDocumentEvent> {
  subject: Subjects.SendDocument = Subjects.SendDocument;
  queueGroupName = queueGroupName;

  async onMessage(data: SendDocumentEvent['data'], msg: Message) {
    const documentId = data.id;

    const document = await Document.findById(documentId);

    if (!document) {
      return;
    }

    document.isDrafts = false;
    document.status = DocumentStatus.PENDING;
    await document.save();
    msg.ack();
  }
}
