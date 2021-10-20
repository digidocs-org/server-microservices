import { NotFoundError } from '@digidocs/guardian';
import Document from 'document-service/models/document';
import { Request, Response } from 'express';

const documentDetailController = async (req: Request, res: Response) => {
  const documentId = req.params.id;

  const document = await Document.findById(documentId);

  if (!document) {
    throw new NotFoundError();
  }

  const documentDetails = document.toJSON({
    transform: (doc, ret) => {
      delete ret.documentId;
      delete ret.publicKeyId;
    },
  });

  return res.send({
    success: true,
    data: {
      document: documentDetails,
    },
  });
};

export default documentDetailController;
