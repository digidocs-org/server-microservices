import { IDocument } from 'authorization-service/models/Document';
import { Request, Response } from 'express';

export const documentDetailsController = (req: Request, res: Response) => {
  let document: any = req.docUserMap?.document as IDocument;

  document = document.toJSON({
    transform: (doc: any, ret: any) => {
      delete ret.documentId;
      delete ret.publicKeyId;
    },
  });

  return res.send({ success: true, data: document });
};
