import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import { IDocument } from 'authorization-service/models/Document';
import { updateDocumentService } from 'authorization-service/services/document/update-document-service';
import { Request, Response } from 'express';

export const updateDocumentController = async (req: Request, res: Response) => {
  const docUserMap = req.docUserMap;

  if (!docUserMap) {
    throw new NotAuthorizedError();
  }

  const document = docUserMap.document as IDocument;

  if (!document.isDrafts) {
    throw new BadRequestError('Cannot update the document!!!');
  }

  const resposne = await updateDocumentService(req);
  return res.send(resposne);
};
