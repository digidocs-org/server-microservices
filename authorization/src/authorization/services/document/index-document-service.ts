import { BadRequestError, DocumentStatus } from '@digidocs/guardian';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { IDocument } from 'authorization-service/models/Document';
import User, { IUser } from 'authorization-service/models/User';
import { IDocumentActions } from 'authorization-service/models/Actions';
import { findUserStatus } from 'authorization-service/utils/find-user-status';

const indexDocumentService = async (userId: string) => {
  try {
    const documentUserMaps = await DocumentUserMap.find({
      user: userId,
      access: true,
    })
      .populate('document')
      .populate('user')
      .populate('action');

    const result = await Promise.all(
      documentUserMaps.map(async docUserMap => {
        const document = docUserMap.document as IDocument;
        const actions = [] as IDocumentActions[];

        const docUserMapsForDoc = await DocumentUserMap.find({
          document: document._id,
        })
          .populate('action')
          .populate('user');

        docUserMapsForDoc.map(docUserMapForDoc => {
          const action = docUserMapForDoc.action as IDocumentActions;
          actions.push(action);
        });

        const user = (await User.findById(document.userId).select(
          '-socialAuthToken -refreshToken -password'
        )) as IUser;

        const actionList: any[] = [];

        if (actions && actions.length) {
          actions.map(action => {
            actionList.push({
              type: action.type,
              email: action.recipientEmail,
              status: action.actionStatus,
              signOrder: action.signOrder,
            });
          });
        }

        return {
          documentName: document.name,
          documentId: document._id,
          ownerName: `${user?.firstname} ${user?.lastname}`,
          createdAt: document.createdAt,
          status: document.status || DocumentStatus.DRAFTS,
          userStatus: findUserStatus(userId, docUserMapsForDoc),
          actions: actionList,
        };
      })
    );

    return result;
  } catch (err) {
    console.log(err);
    throw new BadRequestError('Unable to get Document details');
  }
};

export default indexDocumentService;
