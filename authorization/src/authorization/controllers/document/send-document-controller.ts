import { Request, Response } from 'express';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import Document, { IDocument } from 'authorization-service/models/Document';
import { BadRequestError } from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import { SendEmailPublisher } from 'src/events/publishers/send-email-publisher';
import { natsWrapper } from 'src/nats-wrapper';
import { IUser } from 'authorization-service/models/User';

export const sendDocumentController = async (req: Request, res: Response) => {
  const documentData = req.docUserMap?.document as IDocument;

  const { id: documentId } = documentData;

  const document = await Document.findById(documentId);

  if (!document) {
    throw new BadRequestError('Document not Found');
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

    const user = recipient.user as IUser;

    await recipient.save();
    new SendEmailPublisher(natsWrapper.client).publish({
      senderEmail: 'notifications@digidocs.one',
      clientEmail: user.email,
      subject: 'Document Received',
      body: `You have received the document. Please login to view the document.`,
    });
  } else {
    for (const recipient of recipients) {
      recipient.access = true;
      await recipient.save();
      const user = recipient.user as IUser;
      new SendEmailPublisher(natsWrapper.client).publish({
        senderEmail: 'notifications@digidocs.one',
        clientEmail: user.email,
        subject: 'Document Received',
        body: `You have received the document. Please login to view the document.`,
      });
    }
  }

  return res.send({ success: true });
};
