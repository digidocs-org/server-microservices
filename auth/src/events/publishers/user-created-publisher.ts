import { Publisher, Subjects, UserCreatedEvent } from '@digidocs/guardian'

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
    subject: Subjects.UserCreated = Subjects.UserCreated;
}
