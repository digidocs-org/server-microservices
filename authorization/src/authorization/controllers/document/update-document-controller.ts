import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import { IDocument } from 'authorization-service/models/Document';
import updateDocumentService from 'authorization-service/services/document/update-document-service';
import { Request, Response } from 'express';
import { UpdateDocumentPublisher } from 'src/events/publishers/update-document-publisher';
import { natsWrapper } from 'src/nats-wrapper';

export const updateDocumentController = async (req: Request, res: Response) => {
  const docUserMap = req.docUserMap;

  if (!docUserMap) {
    throw new NotAuthorizedError();
  }

  const document = docUserMap.document as IDocument;

  if (!document.isDrafts) {
    throw new BadRequestError('Cannot update the document!!!');
  }

  const updatedDoc = await updateDocumentService(req);
  
  new UpdateDocumentPublisher(natsWrapper.client).publish({
    id: updatedDoc._id,
    name: updatedDoc.name,
    message: updatedDoc.message,
    inOrder: updatedDoc.inOrder,
    selfSign: updatedDoc.selfSign,
    validTill: updatedDoc.validTill,
    timeToSign: updatedDoc.timeToSign,
    signType: updatedDoc.signType,
    version: updatedDoc.__v,
  });

  return res.send({ success: true, data: updatedDoc });
};
