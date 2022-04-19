import { Subjects, Listener, UpdateDocumentEvent } from '@digidocs/guardian';
import Document from 'signing-service/models/document';
import { queueGroupName } from 'signing-service/types';
import { Message } from 'node-nats-streaming';

export class UpdateDocumentListener extends Listener<UpdateDocumentEvent> {
  subject: Subjects.UpdateDocument = Subjects.UpdateDocument;
  queueGroupName = queueGroupName;

  async onMessage(data: UpdateDocumentEvent['data'], msg: Message) {
    const document = await Document.findById(data.id);

    if (!document) {
      return msg.ack();
    }

    document.set({
      name: data.name || document.name,
      message: data.message || document.message,
      inOrder: data.inOrder !== undefined ? data.inOrder : document.inOrder,
      selfSign: data.selfSign !== undefined ? data.selfSign : document.selfSign,
      hasClickedNext: true,
      validTill: data.validTill || document.validTill,
      timeToSign: data.timeToSign || document.timeToSign,
      signType: data.signType !== undefined ? data.signType : document.signType,
    });
    await document.save();
    msg.ack();
  }
}
