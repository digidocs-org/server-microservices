import {
  DocumentStatus,
  Listener,
  SendDocumentEvent,
  Subjects,
} from '@digidocs/guardian';
import { Message } from 'node-nats-streaming';
import Document from 'signing-service/models/document';
import { queueGroupName } from 'signing-service/types';

export class SendDocumentListener extends Listener<SendDocumentEvent> {
  subject: Subjects.SendDocument = Subjects.SendDocument;
  queueGroupName = queueGroupName;

  async onMessage(data: SendDocumentEvent['data'], msg: Message) {
    const document = await Document.findById(data.id);

    if (!document) {
      return;
    }

    document.status = DocumentStatus.PENDING;
    document.isDrafts = false;
    await document.save();

    msg.ack();
  }
}
