import {
  Subjects,
  EsignSuccessEvent,
  Listener,
  DocumentStatus,
} from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import Document from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import User from 'authorization-service/models/User';
import {
  ActionStatus,
  ActionType,
  queueGroupName,
} from 'authorization-service/types';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from 'src/nats-wrapper';
import { SendEmailPublisher } from '../publishers/send-email-publisher';

export class EsignSuccessListener extends Listener<EsignSuccessEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.SigningSuccess = Subjects.SigningSuccess;

  async onMessage(data: EsignSuccessEvent['data'], msg: Message) {
    const { docId, userId } = data;

    const document = await Document.findById(docId);
    const signer = await DocumentUserMap.findOne({
      document: docId,
      user: userId,
    }).populate('action');

    if (!document || !signer) {
      return;
    }

    // Update Action
    const action = signer.action as IDocumentActions;
    action.actionStatus = ActionStatus.SIGNED;

    const signerAction = signer.action as IDocumentActions;

    signerAction.actionStatus = ActionStatus.SIGNED;

    await signerAction.save();
    await action.save();

    let docUserMaps = await DocumentUserMap.find({ document: docId }).populate(
      'action'
    );

    // TODO Send Email to the user who signed the document.

    if (!document.inOrder) {
      let allSigned = false;
      docUserMaps.forEach(docUserMap => {
        const action = docUserMap.action as IDocumentActions;

        if (
          action.type === ActionType.SIGN &&
          action.actionStatus !== ActionStatus.SIGNED
        ) {
          allSigned = false;
          return;
        }
        allSigned = true;
      });

      if (allSigned) {
        document.status = DocumentStatus.COMPLETED;
        await document.save();
      }

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
        const action = docUserMap.action as IDocumentActions;
        // Send Email to Reciever
        new SendEmailPublisher(natsWrapper.client).publish({
          senderEmail: 'notification@digidocsapp.com',
          clientEmail: action.recipientEmail,
          subject: 'New Document recieved',
          body: 'You have received a new document. Please login to check.',
        });
        msg.ack();
        return;
      }
    }

    document.status = DocumentStatus.COMPLETED;
    await document.save();
    // Send email to all users that document is signed completely.
    const owner = await User.findById(document.userId);

    new SendEmailPublisher(natsWrapper.client).publish({
      senderEmail: 'notification@digidocsapp.com',
      clientEmail: owner!.email,
      subject: 'Document Signed Successfully.',
      body: 'All the recipients have signed the document.',
    });
  }
}
