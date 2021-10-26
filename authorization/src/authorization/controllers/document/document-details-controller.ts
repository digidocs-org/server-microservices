import { IDocumentActions } from 'authorization-service/models/Actions';
import { IDocument } from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { Request, Response } from 'express';

export const documentDetailsController = async (
  req: Request,
  res: Response
) => {
  const documentId = req.params.documentId;
  let document: any = req.docUserMap?.document as IDocument;
  const action = req.docUserMap?.action as IDocumentActions;

  document = document.toJSON({
    transform: (doc: any, ret: any) => {
      delete ret.documentId;
      delete ret.publicKeyId;
    },
  });

  const signatureFields = action.fields;
  const docUserMaps = await DocumentUserMap.find({
    document: documentId,
  }).populate('action');

  const actions = docUserMaps.map(docUserMap => {
    const action = docUserMap.action as IDocumentActions;

    return {
      type: action.type,
      recipientEmail: action.recipientEmail,
      status: action.actionStatus,
      recipientName: action.recipientName,
    };
  });

  return res.send({
    success: true,
    data: { ...document, signatureFields, actions },
  });
};
