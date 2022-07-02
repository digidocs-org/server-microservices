import {
  IDocumentActions,
  IDocumentUserMap,
  IUser,
} from 'document-service/document/models';

const findUserStatus = (userID: string, docUserMaps: IDocumentUserMap[]) => {
  const docUserMap = docUserMaps.find(docUserMap => {
    const user = docUserMap.user as IUser;
    if (user.id === userID) {
      return true;
    }
    return false;
  });

  if (!docUserMap) {
    return;
  }

  const action = docUserMap.action as IDocumentActions;
  return action.actionStatus;
};

export { findUserStatus };
