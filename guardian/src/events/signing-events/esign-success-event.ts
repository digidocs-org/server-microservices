import { SignTypes } from '../../types';
import { Subjects } from '../subjects';

export interface EsignSuccessEvent {
  subject: Subjects.SigningSuccess;
  data: {
    type: SignTypes;
    docId: string;
    userId: string;
  };
}
