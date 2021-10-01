import { Request, Response } from 'express';
import { BadRequestError } from '@digidocs/guardian';
import downloadDocumentService from 'authorization-service/services/document/download-document-service';

const downloadDocumentController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { docUserMap } = req;

  if (!docUserMap) {
    throw new BadRequestError('Cannot access the document!!');
  }

  const document = await downloadDocumentService(id);
  return res.send(document);
};

export default downloadDocumentController;
