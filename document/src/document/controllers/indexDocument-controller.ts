import { Request, Response } from 'express';
import { DocumentStatus,BadRequestError } from '@digidocs/guardian';
import { IDocumentActions,IDocument } from 'document-service/models';
import DocumentUserModel from 'document-service/models/document-user';
import User from 'document-service/models/user';

export const indexDocument = async (req: Request, res: Response) => {
  const documentUserMap = await DocumentUserModel.find({
    user: req.currentUser?.id,
    access: true,
  })
    .populate('action')
    .populate('document');

  if (documentUserMap.length == 0) {
    return res.send({ success: true, data: [] });
  }

  try {
    let index = await Promise.all(
      documentUserMap.map(async (list) => {
        const document = list.document as IDocument;
        const action = list?.action as IDocumentActions;
        let actionsList = [];
        if (action) {
          actionsList.push({
            email: action.recepientEmail,
            status: action.actionStatus,
          });
        }
        const user = await User.findById(document.userId).select(
          '-socialAuthToken -refreshToken -password'
        );
        const data = {
          documentName: document.name,
          documentId: document.id,
          ownerName: `${user?.firstname} ${user?.lastname}`,
          createdAt: document.createdAt,
          status: document.status ?? DocumentStatus.DRAFTS,
          actions: actionsList,
        };
        return data;
      })
    );
    return res.send({ success: true, data: index });
  } catch (error) {
    throw new BadRequestError('something went wrong!!!');
  }
};
