import { Publisher, Subjects, CreateGuestUserEvent } from '@digidocs/guardian';

export class CreateGuestUserPublisher extends Publisher<CreateGuestUserEvent> {
  subject: Subjects.CreateGuestUser = Subjects.CreateGuestUser;
}
