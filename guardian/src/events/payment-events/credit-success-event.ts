import { Subjects } from '../subjects';

export interface CreditSuccessEvent {
  subject: Subjects.CreditSuccess;
  data: {
    userId: string;
    data: { aadhaarCredits: number; digitalSignCredits: number };
  };
}
