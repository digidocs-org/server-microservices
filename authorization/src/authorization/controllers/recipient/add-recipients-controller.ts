import { Request, Response } from 'express';
import { IDocument } from 'authorization-service/models/Document';
import {
  ActionStatus,
  ActionType,
  AuthType,
} from 'authorization-service/types';
import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import Actions from 'authorization-service/models/Actions';
import User from 'authorization-service/models/User';
import createGuestUser from 'authorization-service/services/user/create-guest-user';

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
  const userId = req.currentUser?.id;

  const loggedInUser = await User.findById(userId);

  if (!loggedInUser) {
    throw new NotAuthorizedError();
  }

  if (!document.isDrafts) {
    throw new BadRequestError('Cannot add recipients!');
  }

  if (!recipients) {
    throw new BadRequestError('recepients not provided!!!');
  }

  // If self signing is true then check that logged in user should be present in
  // recipients array.
  if (document.selfSign) {
    const idx = recipients.findIndex(
      recipient => recipient.recipientEmail === loggedInUser.email
    );

    if (idx === -1) {
      throw new BadRequestError(
        'Logged in User should be present in self signed document!!!'
      );
    }
  }

  if (recipients && recipients.length) {
    // Get all recipients of document including owner
    const allRecipients = await DocumentUserMap.find({
      document: document.id,
    });

    // Create array of action ids and document map ids of cocument
    const actionIds = allRecipients.map(recipient => recipient.action);
    const documentMapIds = allRecipients.map(recipient => recipient._id);

    // Delete actions and document maps.
    await Actions.deleteMany({ _id: actionIds });
    await DocumentUserMap.deleteMany({ _id: documentMapIds });

    // If Self signing is false then add the owner with VIEW action
    if (!document.selfSign) {
      const owner = await User.findById(document.userId);

      const action = await Actions.create({
        type: ActionType.VIEW,
        recipientEmail: owner!.email,
      });
      await DocumentUserMap.create({
        user: loggedInUser.id,
        document: document.id,
        action: action,
        access: true,
      });
    }

    // Create action and document user maps of recipients
    for (const recipient of recipients) {
      const { recipientEmail } = recipient;
      const user = await User.findOne({ email: recipientEmail });

      let userId = user?.id;

      if (!user) {
        userId = await createGuestUser(recipientEmail);
      }

      const action = await Actions.create(recipient);

      await DocumentUserMap.create({
        user: userId,
        document: document.id,
        access: recipientEmail === loggedInUser.email,
        action: action.id,
      });
    }
  }

  return res.send({ success: true });
};
