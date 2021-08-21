import { Publisher, Subjects, UserUpdatedEvent } from '@digidocs/guardian'

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
    subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
