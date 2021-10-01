import { IDocument } from 'authorization-service/models/Document';
import {
  ActionStatus,
  ActionType,
  AuthType,
} from 'authorization-service/types';
import { Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import Actions from 'authorization-service/models/Actions';
import User from 'authorization-service/models/User';

interface Recipient {
  type: ActionType;
  privateMessage: string;
  authType: AuthType;
  recepientName: string;
  actionStatus: ActionStatus;
  recepientEmail: string;
  signOrder: number;
}

const addRecipientsController = async (req: Request, res: Response) => {
  const recipients = req.body.recipients as Recipient[];
  const document = req.docUserMap?.document as IDocument;
  const loggedInUser = req.currentUser;

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
      recipient => recipient.recepientEmail === loggedInUser.email
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

    // If Self signing is false then add the owner without any action
    if (!document.selfSign) {
      await DocumentUserMap.create({
        user: loggedInUser.id,
        document: document.id,
        access: true,
      });
    }

    // Create action and document user maps of recipients
    for (const recipient of recipients) {
      const { recepientEmail } = recipient;
      const user = await User.findOne({ email: recepientEmail });

      let userId = user?.id;

      if (!user) {
        // userId = await createGuestUser(recepientEmail);
      }

      const action = await Actions.create(recipient);

      await DocumentUserMap.create({
        user: userId,
        document: document.id,
        access: recepientEmail === loggedInUser.email,
        action: action.id,
      });
    }
  }

  return res.send({ success: true });
};

export default addRecipientsController;
