import {
  ActionStatus,
  ActionType,
  AuthType,
  DocumentStatus,
  SignTypes,
} from '../../types';
import { Subjects } from '../subjects';

export interface SendDocumentEvent {
  subject: Subjects.SendDocument;
  data: {
    document: {
      id?: string;
      name: string;
      message?: string;
      inOrder?: boolean;
      publicKeyId: string;
      documentId: string;
      selfSign?: boolean;
      isDrafts?: boolean;
      status?: DocumentStatus;
      signType?: SignTypes;
      userId: string;
      hasClickedNext: boolean;
      validTill?: string;
      sendForSign?: boolean;
      timeToSign?: string;
      createdAt: string;
      reservedAadhaarCredits: number;
      reservedDigitalCredits: number;
      updatedAt: string;
      version: number;
    };
    docUserMaps: {
      user: string;
      document: string;
      access: boolean;
      action: {
        type: ActionType;
        privateMessage: string;
        viewOn: Date;
        view: Boolean;
        authType: AuthType;
        authCode: number;
        recipientEmail: string;
        actionStatus: ActionStatus;
        recipientName: string;
        signOrder: number;
        fields?: {
          dataX: number;
          dataY: number;
          height: number;
          width: number;
          pageNumber: number;
          recipientName: string;
          recipientEmail: string;
          dragTypeID: string;
        }[];
      };
    }[];
  };
}
