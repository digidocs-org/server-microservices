import { Subjects, Listener, CreateDocumentEvent } from '@digidocs/guardian';
import { queueGroupName } from 'authorization-service/types';
import { Message } from 'node-nats-streaming';
import Document from 'authorization-service/models/Document';

export class CreateDocumentListener extends Listener<CreateDocumentEvent> {
  subject: Subjects.CreateDocument = Subjects.CreateDocument;
  queueGroupName = queueGroupName;

  async onMessage(data: CreateDocumentEvent['data'], msg: Message) {
    try {
      await Document.create({
        _id: data.id,
        name: data.name,
        message: data.message,
        inOrder: data.inOrder,
        publicKeyId: data.publicKeyId,
        documentId: data.documentId,
        selfSign: data.selfSign,
        isDrafts: data.isDrafts,
        status: data.status,
        signType: data.signType,
        userId: data.userId,
        validTill: data.validTill,
        timeToSign: data.timeToSign,
        version: data.version,
      });
      msg.ack();
    } catch (error) {
      console.log(error);
      msg.ack();
    }
  }
}
