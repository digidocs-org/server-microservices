import { indexDocumentService } from 'document-service/document/services';
import { Request, Response } from 'express';
import { NotAuthorizedError } from '@digidocs/guardian';

export const indexDocumentController = async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;
  const { query } = req;

  if (!userId) {
    throw new NotAuthorizedError();
  }

  const { documents, totalPages, currentPage, categorization } =
    await indexDocumentService(userId, query, req, res);
  return res.send({
    success: true,
    data: documents,
    categorization,
    totalPages,
    currentPage,
  });
};
