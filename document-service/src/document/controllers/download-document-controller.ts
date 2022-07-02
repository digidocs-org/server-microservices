import { Request, Response } from 'express';
import { BadRequestError } from '@digidocs/guardian';
import { downloadDocumentService } from 'document-service/document/services';
import { IDocument, IAuditTrail } from 'document-service/document/models';

export const downloadDocumentController = async (
  req: Request,
  res: Response
) => {
  const { docUserMap } = req;
  const documentData = docUserMap?.document as IDocument;

  if (!docUserMap) {
    throw new BadRequestError('Cannot access the document!!');
  }
  const documentBase64 = await downloadDocumentService(documentData.id);
  const auditTrail = docUserMap.auditTrail as IAuditTrail;
  if (auditTrail && !auditTrail.view) {
    auditTrail.view = new Date();
    auditTrail.save();
  }
  return res.send(documentBase64);
};
