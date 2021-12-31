import { Request, Response } from 'express';
import { BadRequestError } from '@digidocs/guardian';
import downloadDocumentService from 'authorization-service/services/document/download-document-service';
import { IDocument } from 'authorization-service/models/Document';
import { IAuditTrail } from 'authorization-service/models/AuditTrail';

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
