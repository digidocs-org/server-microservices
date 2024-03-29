import { IDocumentActions } from 'authorization-service/models/Actions';
import { IDocument } from 'authorization-service/models/Document';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import User, { IUser } from 'authorization-service/models/User';
import { findUserStatus } from 'authorization-service/utils/find-user-status';
import { Request, Response } from 'express';

export const documentDetailsController = async (
  req: Request,
  res: Response
) => {
  const documentId = req.params.documentId;
  const userId = req.currentUser?.id as string;
  let document: any = req.docUserMap?.document as IDocument;
  const action = req.docUserMap?.action as IDocumentActions;
  const owner = await User.findById(document.userId);

  if (!document.isDrafts && !action.view) {
    action.view = true;
    action.viewOn = new Date();
  }

  await action.save();

  const signatureFields = action.fields;
  const docUserMaps = await DocumentUserMap.find({
    document: documentId,
  })
    .populate('action')
    .populate('user')
    .populate('auditTrail');

  document = document.toJSON({
    transform: (doc: any, ret: any) => {
      ret.documentName = ret.name;
      ret.id = ret._id;
      delete ret.name;
      delete ret._id;
      delete ret.publicKeyId;
      ret.ownerName = `${owner?.firstname ?? ''} ${owner?.lastname ?? ''}`;

      ret.ownerEmail = owner?.email;
      ret.userStatus = findUserStatus(userId, docUserMaps);
    },
  });

  const actions = docUserMaps.map(docUserMap => {
    const action: any = docUserMap.action as IDocumentActions;
    const user = docUserMap.user as IUser;

    return action.toJSON({
      transform: (doc: any, ret: any) => {
        ret.email = ret.recipientEmail;
        ret.status = ret.actionStatus;
        ret.name =
          action.recipientName ??
          `${user.firstname ?? ''} ${user.lastname ?? ''}`;
        delete ret.authCode;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.actionStatus;
        delete ret.recipientEmail;
        delete ret.recipientName;
      },
    });
  });

  return res.send({
    success: true,
    data: { ...document, signatureFields, actions },
  });
};
