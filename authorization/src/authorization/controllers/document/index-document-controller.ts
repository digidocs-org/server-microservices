import indexDocumentService from 'authorization-service/services/document/index-document-service';
import { Request, Response } from 'express';
import { NotAuthorizedError } from '@digidocs/guardian';

export const indexDocumentController = async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    throw new NotAuthorizedError();
  }

  const documents = await indexDocumentService(userId);
  return res.send({ success: true, data: documents });
};
