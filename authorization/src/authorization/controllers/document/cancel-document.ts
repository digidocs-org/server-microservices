import {
  BadRequestError,
  CreditUpdateType,
  DocumentStatus,
  NotAuthorizedError,
  SignTypes,
} from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import { IDocument } from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import User, { IUser } from 'authorization-service/models/User';
import { ActionStatus, ActionType } from 'authorization-service/types';
import { Request, Response } from 'express';
import { CreditUpdatePublisher } from 'src/events/publishers/credit-update-publisher';
import { SendEmailPublisher } from 'src/events/publishers/send-email-publisher';
import { UpdateDocumentPublisher } from 'src/events/publishers/update-document-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const cancelDocument = async (req: Request, res: Response) => {
  const currUserMap = req.docUserMap;

  const userId = req.currentUser?.id
  const user = await User.findById(userId)

  if (!user) {
    throw new BadRequestError("User not found")
  }

  if (!currUserMap) {
    throw new NotAuthorizedError();
  }

  const action = currUserMap.action as IDocumentActions;
  const document = currUserMap.document as IDocument;

  if (
    document.status === DocumentStatus.PENDING &&
    ((action.type === ActionType.SIGN &&
      action.actionStatus === ActionStatus.RECEIVED) ||
      req.currentUser?.id == document.userId)
  ) {
    const documentStatus =
      req.currentUser?.id === document.userId
        ? DocumentStatus.VOIDED
        : DocumentStatus.CANCELLED;
    document.status = documentStatus;
    await document.save();
    new UpdateDocumentPublisher(natsWrapper.client).publish({
      id: document._id,
      name: document.name,
      version: document.version,
      status: documentStatus,
    });
    const docUserMaps = await DocumentUserMap.find({
      document: document.id,
      access: true,
    }).populate('user');

    for (const docUserMap of docUserMaps) {
      const user = docUserMap.user as IUser;
      new SendEmailPublisher(natsWrapper.client).publish({
        senderEmail: 'notification@digidocs.one',
        clientEmail: user.email,
        subject: `DOCUMENT ${documentStatus}`,
        body: `${document.name
          } has been ${documentStatus.toLowerCase()} by a user.`,
      });
    }

    //Update user info an put all remaining credits
    if (document.signType == SignTypes.AADHAR_SIGN) {
      const reservedCredits = document.reservedAadhaarCredits
      user.aadhaarCredits += document.reservedAadhaarCredits
      document.reservedAadhaarCredits = 0
      await user.save()
      await document.save()
      new CreditUpdatePublisher(natsWrapper.client).publish({
        userId: user.id,
        data: {
          aadhaarCredits: reservedCredits,
          digitalSignCredits: 0
        },
        type: CreditUpdateType.ADDED
      })
    } else if (document.signType == SignTypes.DIGITAL_SIGN) {
      const reservedCredits = document.reservedDigitalCredits
      user.digitalSignCredits += document.reservedDigitalCredits
      document.reservedDigitalCredits = 0
      await user.save()
      await document.save()
      new CreditUpdatePublisher(natsWrapper.client).publish({
        userId: user.id,
        data: {
          aadhaarCredits: 0,
          digitalSignCredits: reservedCredits
        },
        type: CreditUpdateType.ADDED
      })
    }

    return res.send({ success: true });
  } else {
    throw new BadRequestError('Cannot cancel document!!');
  }
};

export { cancelDocument };
