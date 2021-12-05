import { CreditSuccessEvent, Publisher, Subjects } from '@digidocs/guardian';

export class CreditSuccessPublisher extends Publisher<CreditSuccessEvent> {
  subject: Subjects.CreditSuccess = Subjects.CreditSuccess;
}
