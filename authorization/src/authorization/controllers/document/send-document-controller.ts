import { Request, Response } from 'express';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import Document, { IDocument } from 'authorization-service/models/Document';
import { BadRequestError, DocumentStatus } from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import { SendEmailPublisher } from 'src/events/publishers/send-email-publisher';
import { natsWrapper } from 'src/nats-wrapper';
import { IUser } from 'authorization-service/models/User';
import SendDocumentPublisher from 'src/events/publishers/send-document-publisher';
import { ActionStatus } from 'authorization-service/types';

export const sendDocumentController = async (req: Request, res: Response) => {
  const documentData = req.docUserMap?.document as IDocument;

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

  if (!document.selfSign) {
    recipients = recipients.filter(recipient => {
      return document.userId !== recipient.user.toString();
    });
  }

  if (!recipients.length) {
    throw new BadRequestError('No recipients added');
  }

  if (document.inOrder) {
    recipients.sort((a, b) => {
      const aAction = a.action as IDocumentActions;
      const bAction = b.action as IDocumentActions;

      return aAction.signOrder < bAction.signOrder ? -1 : 0;
    });

    const recipient = recipients[0];

    recipient.access = true;

    const action = recipient.action as IDocumentActions;
    action.actionStatus = ActionStatus.RECEIVED;

    const user = recipient.user as IUser;

    await recipient.save();
    await action.save();
    new SendEmailPublisher(natsWrapper.client).publish({
      senderEmail: 'notifications@digidocs.one',
      clientEmail: user.email,
      subject: 'Document Received',
      body: `You have received the document. Please login to view the document.`,
    });
  } else {
    for (const recipient of recipients) {
      const action = recipient.action as IDocumentActions;
      recipient.access = true;
      action.actionStatus = ActionStatus.RECEIVED;
      await recipient.save();
      await action.save();
      const user = recipient.user as IUser;
      new SendEmailPublisher(natsWrapper.client).publish({
        senderEmail: 'notifications@digidocs.one',
        clientEmail: user.email,
        subject: 'Document Received',
        body: `You have received the document. Please login to view the document.`,
      });
    }
  }

  document.isDrafts = false;
  document.status = DocumentStatus.PENDING;
  await document.save();

  //TODO: Update credits
  //TODO: Update user profile credits
  //TODO: Update document credits

  await new SendDocumentPublisher(natsWrapper.client).publish({
    id: documentId,
  });

  return res.send({ success: true });
};
