import {
  Subjects,
  EsignSuccessEvent,
  Listener,
  DocumentStatus,
  SignTypes,
} from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import AuditTrail, {
  IAuditTrail,
} from 'authorization-service/models/AuditTrail';
import Document from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import User from 'authorization-service/models/User';
import {
  ActionStatus,
  ActionType,
  queueGroupName,
} from 'authorization-service/types';
import { sendReceivedEmail } from 'authorization-service/utils/send-received-email';
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
    })
      .populate('action')
      .populate('auditTrail');

    if (!document || !signer) {
      return;
    }

    // Update Action
    const signerAction = signer.action as IDocumentActions;
    signerAction.actionStatus = ActionStatus.SIGNED;

    const signerAuditTrail = signer.auditTrail as IAuditTrail;
    signerAuditTrail.sign = new Date();

    await signerAction.save();
    await signerAuditTrail.save();

    let docUserMaps = await DocumentUserMap.find({ document: docId })
      .populate('action')
      .populate('auditTrail');

    //Decrease credit stored in document
    if (document.signType == SignTypes.AADHAR_SIGN) {
      document.reservedAadhaarCredits -= 1
      await document.save()
    } else if (document.signType == SignTypes.DIGITAL_SIGN) {
      document.reservedDigitalCredits -= 1
      await document.save()
    }

    // TODO Send Email to the user who signed the document.

    if (!document.inOrder) {
      let allSigned = false;

      for (const docUserMap of docUserMaps) {
        const action = docUserMap.action as IDocumentActions;

        if (
          action.type === ActionType.SIGN &&
          action.actionStatus !== ActionStatus.SIGNED
        ) {
          allSigned = false;
          break;
        }
        allSigned = true;
      }

      if (allSigned) {
        document.status = DocumentStatus.COMPLETED;
        await document.save();
      }

      msg.ack();
      return;
    }

    // If document is inOrder then give access to next user with SIGN type.
    docUserMaps = docUserMaps.sort((a, b) => {
      const aAction = a.action as IDocumentActions;
      const bAction = b.action as IDocumentActions;

      return aAction.signOrder > bAction.signOrder ? 1 : -1;
    });

    for (const docUserMap of docUserMaps) {
      if (!docUserMap.access) {
        docUserMap.access = true;
        docUserMap.auditTrail = await AuditTrail.create({
          receive: new Date(),
        });
        await docUserMap.save();
        const action = docUserMap.action as IDocumentActions;
        action.actionStatus = ActionStatus.RECEIVED;
        await action.save();
        sendReceivedEmail(docUserMap);
        msg.ack();
        if (action.type === ActionType.SIGN) {
          break;
        }
      }
    }

    let allSigned = false;

    for (const docUserMap of docUserMaps) {
      const action = docUserMap.action as IDocumentActions;

      if (
        action.type === ActionType.SIGN &&
        action.actionStatus !== ActionStatus.SIGNED
      ) {
        allSigned = false;
        break;
      }
      allSigned = true;
    }

    if (allSigned) {
      document.status = DocumentStatus.COMPLETED;
      await document.save();
      // TODO Send email to all users that document is signed completely with audit trail
      // Currently mail is send only to user.
      const owner = await User.findById(document.userId);

      if (!owner) {
        msg.ack();
        return;
      }

      new SendEmailPublisher(natsWrapper.client).publish({
        senderEmail: 'notification@digidocsapp.com',
        clientEmail: owner.email,
        subject: 'Document Signed Successfully.',
        body: 'All the recipients have signed the document.',
      });
    }
    msg.ack();
  }
}
