import { CreditType } from '../../types';
import { Subjects } from '../subjects';

export interface CreditSuccessEvent {
  subject: Subjects.CreditSuccess;
  data: {
    userId: string;
    creditType: CreditType;
    credits: number;
  };
}
