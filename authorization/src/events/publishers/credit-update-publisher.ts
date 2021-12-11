import { CreditUpdateEvent, Publisher, Subjects } from '@digidocs/guardian';

export class CreditUpdatePublisher extends Publisher<CreditUpdateEvent> {
  subject: Subjects.CreditUpdate = Subjects.CreditUpdate;
}
