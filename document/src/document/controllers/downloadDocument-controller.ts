import { NextFunction, Request, Response } from 'express';
import { IDocument } from 'document-service/models';
import {
  BadRequestError,
  decryptDocument,
  fetchData,
  NotFoundError,
} from '@digidocs/guardian';
import Document from 'document-service/models/document';

export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const document = req.documentUserMap?.document as IDocument;

    const { documentId } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      throw new NotFoundError();
    }

    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

    if (decryptedFile) {
      // res.writeHead(200, {
      //   'Content-Type': 'application/pdf',
      //   'Content-Length': decryptedFile.length,
      // });
      // return res.end(decryptedFile);
      return res.send(decryptedFile.toString("base64"))
    }
    throw new BadRequestError('cannot download document');
  } catch (error) {
    return next(error);
  }
};
