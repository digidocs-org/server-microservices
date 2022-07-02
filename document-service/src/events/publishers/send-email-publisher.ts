import { Publisher, Subjects, SendEmailEvent } from '@digidocs/guardian';

export class SendEmailPublisher extends Publisher<SendEmailEvent> {
  subject: Subjects.SendEmail = Subjects.SendEmail;
}
