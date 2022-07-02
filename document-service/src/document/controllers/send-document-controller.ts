import { Request, Response } from 'express';
import {
  BadRequestError,
  CreditUpdateType,
  DocumentStatus,
  PaymentRequiredError,
  SignTypes,
} from '@digidocs/guardian';
import { natsWrapper } from 'src/nats-wrapper';
import { ActionStatus, ActionType } from '@digidocs/guardian';
import {
  DocumentUserMap,
  Document,
  IDocument,
  IDocumentActions,
  User,
  AuditTrail,
  IUser,
} from 'document-service/document/models';
import { sendReceivedEmail } from 'document-service/document/utils/send-received-email';
import {
  CreditUpdatePublisher,
  SendDocumentPublisher,
} from 'document-service/events/publishers';

export const sendDocumentController = async (req: Request, res: Response) => {
  const documentData = req.docUserMap?.document as IDocument;
  const userId = req.currentUser?.id;
  const user = await User.findById(userId);

  if (!user) {
    throw new BadRequestError('User not found');
  }

  const { id: documentId } = documentData;

  const document = await Document.findById(documentId);

  if (!document) {
    throw new BadRequestError('Document not Found');
  }

  if (!document.isDrafts) {
    throw new BadRequestError('Cannot send the document!!!');
  }

  let recipients = await DocumentUserMap.find({
    document: documentId,
  })
    .populate('document')
    .populate('action')
    .populate('user');

  if (!recipients.length) {
    throw new BadRequestError('No recipients added');
  }

  //Check if credits are sufficient to send document
  const signType = document.signType;
  if (signType == SignTypes.AADHAR_SIGN) {
    if (user.aadhaarCredits < recipients.length) {
      throw new PaymentRequiredError('Not enough aadhaar sign credits', {
        aadhaarCredits: recipients.length - user.aadhaarCredits,
      });
    }
  } else if (signType == SignTypes.DIGITAL_SIGN) {
    if (user.digitalSignCredits < recipients.length) {
      throw new PaymentRequiredError('Not enough digital sign credits', {
        digitalCredits: recipients.length - user.digitalSignCredits,
      });
    }
  } else {
    throw new PaymentRequiredError('Not enough credits', {
      aadhaarCredits: recipients.length - user.aadhaarCredits,
      digitalCredits: recipients.length - user.digitalSignCredits,
    });
  }

  if (!document.selfSign) {
    recipients = recipients.filter(recipient => {
      return document.userId !== recipient.user.toString();
    });
  }

  //Check if inOrder or not
  if (document.inOrder) {
    recipients.sort((a, b) => {
      const aAction = a.action as IDocumentActions;
      const bAction = b.action as IDocumentActions;

      return aAction.signOrder < bAction.signOrder ? -1 : 0;
    });

    for (const recipient of recipients) {
      recipient.access = true;
      recipient.auditTrail = await AuditTrail.create({
        receive: new Date(),
      });

      const action = recipient.action as IDocumentActions;
      action.actionStatus = ActionStatus.RECEIVED;

      await recipient.save();
      await action.save();

      sendReceivedEmail(recipient);

      if (action.type === ActionType.SIGN) {
        break;
      }
    }
  } else {
    for (const recipient of recipients) {
      const action = recipient.action as IDocumentActions;
      recipient.access = true;
      recipient.auditTrail = await AuditTrail.create({
        receive: new Date(),
      });
      action.actionStatus = ActionStatus.RECEIVED;
      await recipient.save();
      await action.save();
      sendReceivedEmail(recipient);
    }
  }

  document.isDrafts = false;
  document.status = DocumentStatus.PENDING;
  await document.save();

  //Update user profile and document credits
  if (signType == SignTypes.AADHAR_SIGN) {
    user.aadhaarCredits -= recipients.length;
    document.reservedAadhaarCredits += recipients.length;
    await user.save();
    await document.save();
    new CreditUpdatePublisher(natsWrapper.client).publish({
      userId: user.id,
      data: {
        aadhaarCredits: recipients.length,
        digitalSignCredits: 0,
      },
      type: CreditUpdateType.SUBTRACTED,
    });
  } else if (signType == SignTypes.DIGITAL_SIGN) {
    user.digitalSignCredits -= recipients.length;
    document.reservedDigitalCredits += recipients.length;
    await user.save();
    await document.save();
    new CreditUpdatePublisher(natsWrapper.client).publish({
      userId: user.id,
      data: {
        aadhaarCredits: 0,
        digitalSignCredits: recipients.length,
      },
      type: CreditUpdateType.SUBTRACTED,
    });
  }

  new SendDocumentPublisher(natsWrapper.client).publish({
    document: document.toJSON(),
    docUserMaps: recipients.map(map => {
      const user = map.user as IUser;
      const action = map.action as IDocumentActions;
      const document = map.document as IDocument;

      return {
        user: user.id,
        action: action.toJSON(),
        access: map.access,
        document: document.id,
      };
    }),
  });

  return res.send({ success: true });
};
