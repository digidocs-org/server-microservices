import { BadRequestError, DocumentStatus } from '@digidocs/guardian';
import DocumentUserMap from 'authorization-service/models/DocumentUserMap';
import { IDocument } from 'authorization-service/models/Document';
import User, { IUser } from 'authorization-service/models/User';
import { IDocumentActions } from 'authorization-service/models/Actions';

const indexDocumentService = async (userId: string) => {
  try {
    const documentUserMaps = await DocumentUserMap.find({
      user: userId,
      access: true,
    })
      .populate('document')
      .populate('user')
      .populate('actions');

    const result = await Promise.all(
      documentUserMaps.map(async docUserMap => {
        const document = docUserMap.document as IDocument;
        const action = docUserMap.action as IDocumentActions;
        const user = await User.findById(document.userId).select(
          '-socialAuthToken -refreshToken -password'
        ) as IUser;
        const actionList = [];

        if (action) {
          actionList.push({
            email: action.recepientEmail,
            status: action.actionStatus,
          });
        }

        return {
          documentName: document.name,
          documentId: document._id,
          ownerName: `${user?.firstname} ${user?.lastname}`,
          createdAt: document.createdAt,
          status: document.status || DocumentStatus.DRAFTS,
          actions: actionList,
        };
      })
    );
    
    return result;
  } catch (err) {
    console.log(err)
    throw new BadRequestError('Unable to get Document details');
  }
};

export default indexDocumentService;
