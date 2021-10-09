import {
  Subjects,
  EsignSuccessEvent,
  Listener,
  DocumentStatus,
} from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import Document from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { ActionStatus, queueGroupName } from 'authorization-service/types';
import { Message } from 'node-nats-streaming';

export class EsignSuccessListener extends Listener<EsignSuccessEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.SigningSuccess = Subjects.SigningSuccess;

  async onMessage(data: EsignSuccessEvent['data'], msg: Message) {
    const { docId, userId } = data;

    let docUserMaps = await DocumentUserMap.find({ document: docId }).populate(
      'action'
    );
    const document = await Document.findById(docId);
    const signer = await DocumentUserMap.findOne({
      document: docId,
      user: userId,
    }).populate('action');

    if (!document || !signer) {
      return;
    }

    const signerAction = signer.action as IDocumentActions;

    signerAction.actionStatus = ActionStatus.SIGNED;

    await signerAction.save();

    // TODO Send Email to the user who signed the document.

    if (!document.inOrder) {
      msg.ack();
      return;
    }

    // If document is inOrder then give access to next user.
    docUserMaps = docUserMaps.sort((a, b) => {
      const aAction = a.action as IDocumentActions;
      const bAction = b.action as IDocumentActions;

      return aAction.signOrder > bAction.signOrder ? 1 : -1;
    });

    for (const docUserMap of docUserMaps) {
      if (!docUserMap.access) {
        docUserMap.access = true;
        await docUserMap.save();
        // TODO Send Email to Reciever
        msg.ack();
        return;
      }
    }

    document.status = DocumentStatus.COMPLETED;
    await document.save();
    // TODO Send email to all users that document is signed completely.
  }
}
