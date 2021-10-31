import { Subjects, Listener, UpdateDocumentEvent } from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import Document from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { ActionType, queueGroupName } from 'authorization-service/types';
import { Message } from 'node-nats-streaming';

export class UpdateDocumentListener extends Listener<UpdateDocumentEvent> {
  subject: Subjects.UpdateDocument = Subjects.UpdateDocument;
  queueGroupName = queueGroupName;

  async onMessage(data: UpdateDocumentEvent['data'], msg: Message) {
    const document = await Document.findById(data.id);

    if (!document) {
      return;
    }

    const documentUserMap = await DocumentUserMap.findOne({
      document: data.id,
      user: document.userId,
    }).populate('action');

    if (!documentUserMap) {
      return;
    }

    const action = documentUserMap.action as IDocumentActions;

    // If self signing is true then update the action type.
    if (data.selfSign && !document.selfSign) {
      action.type = ActionType.SIGN;
    }

    // If self signing is false then update the action type.
    if (!data.selfSign && document.selfSign) {
      action.type = ActionType.VIEW;
    }

    document.set({
      name: data.name || document.name,
      message: data.message || document.message,
      inOrder: data.inOrder !== undefined ? data.inOrder : document.inOrder,
      selfSign: data.selfSign !== undefined ? data.selfSign : document.selfSign,
      validTill: data.validTill || document.validTill,
      timeToSign: data.timeToSign || document.timeToSign,
      signType: data.signType !== undefined ? data.signType : document.signType,
    });

    await action.save();
    await document.save();
    msg.ack();
  }
}
