import { Publisher, Subjects, UserCreatedEvent } from '@digidocs-org/guardian'

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
    subject: Subjects.UserCreated = Subjects.UserCreated;
}
