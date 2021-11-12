import { IDocumentActions } from 'authorization-service/models/Actions';
import { IDocument } from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import User from 'authorization-service/models/User';
import { Request, Response } from 'express';

export const documentDetailsController = async (
  req: Request,
  res: Response
) => {
  const documentId = req.params.documentId;
  let document: any = req.docUserMap?.document as IDocument;
  const action = req.docUserMap?.action as IDocumentActions;
  const owner = await User.findById(document.userId);

  document = document.toJSON({
    transform: (doc: any, ret: any) => {
      ret.documentName = ret.name;
      delete ret.name;
      delete ret.publicKeyId;
      ret.ownerName = `${owner?.firstname} ${owner?.lastname}`;
      ret.ownerEmail = owner?.email;
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
      email: action.recipientEmail,
      status: action.actionStatus,
      name: action.recipientName,
      fields: action.fields,
    };
  });

  return res.send({
    success: true,
    data: { ...document, signatureFields, actions },
  });
};