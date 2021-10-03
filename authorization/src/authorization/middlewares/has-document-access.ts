/* eslint-disable @typescript-eslint/no-namespace */
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '@digidocs/guardian';
import DocumentUserMap, {
  IDocumentUserMap,
} from 'authorization-service/models/DocumentUserMap';

declare global {
  namespace Express {
    interface Request {
      docUserMap?: IDocumentUserMap;
    }
  }
}

const hasDocumentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    throw new BadRequestError('Cannot access the document!!');
  }

  const documentId = req.body.documentId;

  const docUserMap = await DocumentUserMap.findOne({
    user: userId,
    document: documentId,
  })
    .populate('document')
    .populate('action')
    .populate('user');

  if (!docUserMap || docUserMap.access) {
    throw new BadRequestError('Cannot access the document!!');
  }

  req.docUserMap = docUserMap;
  next();
};

export default hasDocumentAccess;
