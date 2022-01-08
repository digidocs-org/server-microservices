import { Request, Response } from 'express';
import { IDocument } from 'authorization-service/models/Document';
import {
  ActionStatus,
  ActionType,
  AuthType,
} from 'authorization-service/types';
import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import Actions, {
  IDocumentActions,
} from 'authorization-service/models/Actions';
import User from 'authorization-service/models/User';
import createGuestUser from 'authorization-service/services/user/create-guest-user';
import AuditTrail, {
  IAuditTrail,
} from 'authorization-service/models/AuditTrail';

interface Recipient {
  type: ActionType;
  privateMessage: string;
  authType: AuthType;
  recipientName: string;
  actionStatus: ActionStatus;
  recipientEmail: string;
  signOrder: number;
}

export const addRecipientsController = async (req: Request, res: Response) => {
  const recipients = req.body.recipients as Recipient[];
  const document = req.docUserMap?.document as IDocument;

  const loggedInUser = await User.findById(document.userId);

  if (!loggedInUser) {
    throw new NotAuthorizedError();
  }

  if (!document.isDrafts) {
    throw new BadRequestError('Cannot add recipients!');
  }

  if (!recipients) {
    throw new BadRequestError('recepients not provided!!!');
  }

  if (recipients && recipients.length) {
    // Get all recipients of document including owner
    const allRecipients = await DocumentUserMap.find({
      document: document.id,
    })
      .populate('action')
      .populate('auditTrail');

    // Create array of action ids and document map ids of cocument
    const actionIdsArray: string[] = [];
    const docUserMapIdsArray: string[] = [];
    const auditTrails: string[] = [];

    allRecipients.map(recipient => {
      const recipientAction = recipient.action as IDocumentActions;
      const auditTrail = recipient.auditTrail as IAuditTrail;
      if (recipientAction.recipientEmail !== loggedInUser.email) {
        actionIdsArray.push(recipientAction._id);
        docUserMapIdsArray.push(recipient._id);
        auditTrail && auditTrails.push(auditTrail.id);
      }
    });

    // Delete actions and document maps.
    await Actions.deleteMany({ _id: actionIdsArray });
    await DocumentUserMap.deleteMany({ _id: docUserMapIdsArray });
    await AuditTrail.deleteMany({ _id: auditTrails });

    // If Self signing is false then add the owner with VIEW action
    // if (!document.selfSign) {
    //   const owner = await User.findById(document.userId);

    //   const action = await Actions.create({
    //     type: ActionType.VIEW,
    //     recipientEmail: owner!.email,
    //   });
    //   await DocumentUserMap.create({
    //     user: loggedInUser.id,
    //     document: document.id,
    //     action: action,
    //     access: true,
    //   });
    // }

    // Create action and document user maps of recipients
    for (const recipient of recipients) {
      const { recipientEmail } = recipient;
      const user = await User.findOne({ email: recipientEmail });

      let userId = user?.id;

      if (!user) {
        userId = await createGuestUser(recipientEmail);
      }

      const action = await Actions.create(recipient);

      const docUserMapAlreadyExists = await DocumentUserMap.findOne({
        user: userId,
        document: document._id,
      });

      if (!docUserMapAlreadyExists) {
        await DocumentUserMap.create({
          user: userId,
          document: document.id,
          access: recipientEmail === loggedInUser.email,
          action: action.id,
        });
      }
    }
  }

  return res.send({ success: true });
};
