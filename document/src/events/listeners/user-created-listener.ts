import { Subjects, Listener, UserCreatedEvent } from '@digidocs/guardian';
import { queueGroupName } from 'document-service/types'
import { Message } from 'node-nats-streaming';

export class CreateUserListener extends Listener<UserCreatedEvent>{
    subject: Subjects.UserCreated = Subjects.UserCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserCreatedEvent['data'], msg: Message) {
        try {
            console.log(data)
            msg.ack()
        } catch (error) {
            console.log(error)
            msg.ack()
        }
    }
}