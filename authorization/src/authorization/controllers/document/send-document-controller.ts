import { Request, Response } from 'express';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import Document, { IDocument } from 'authorization-service/models/Document';
import { BadRequestError } from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';

export const sendDocumentController = async (req: Request, res: Response) => {
  const documentData = req.docUserMap?.document as IDocument

  const { id: documentId } = documentData.id

  const document = await Document.findById(documentId);

  if (!document) {
    throw new BadRequestError('Document not Found');
  }

  let recipients = await DocumentUserMap.find({
    document: documentId,
  })
    .populate('document')
    .populate('action');

  if (!document.selfSign) {
    recipients = recipients.filter(recipient => {
      return document.userId !== recipient.user.toString();
    });
  }

  if (document.inOrder) {
    recipients.sort((a, b) => {
      const aAction = a.action as IDocumentActions;
      const bAction = b.action as IDocumentActions;

      return aAction.signOrder < bAction.signOrder ? -1 : 0;
    });

    const recipient = recipients[0];

    recipient.access = true;

    await recipient.save();
  } else {
    for (const recipient of recipients) {
      recipient.access = true;
      await recipient.save();
    }
  }

  return res.send({ success: true });
};
