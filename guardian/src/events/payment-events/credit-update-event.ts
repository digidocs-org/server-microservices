import { CreditUpdateType } from '../../types';
import { Subjects } from '../subjects';

export interface CreditUpdateEvent {
  subject: Subjects.CreditUpdate;
  data: {
    userId: string;
    data: { aadhaarCredits?: number; digitalSignCredits?: number };
    type: CreditUpdateType
  };
}
