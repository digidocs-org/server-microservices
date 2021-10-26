import { Request, Response } from 'express';
import { BadRequestError } from '@digidocs/guardian';
import downloadDocumentService from 'authorization-service/services/document/download-document-service';
import { IDocument } from 'authorization-service/models/Document';

export const downloadDocumentController = async (req: Request, res: Response) => {
  const { docUserMap } = req;
  const documentData = docUserMap?.document as IDocument

  if (!docUserMap) {
    throw new BadRequestError('Cannot access the document!!');
  }
  const document = await downloadDocumentService(documentData.id);
  return res.send(document);
};