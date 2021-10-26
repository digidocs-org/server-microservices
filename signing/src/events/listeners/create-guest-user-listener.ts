import { Listener, CreateGuestUserEvent, Subjects } from '@digidocs/guardian';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from 'signing-service/types';
import User from 'signing-service/models/user';

export class CreateGuestUserListener extends Listener<CreateGuestUserEvent> {
  subject: Subjects.CreateGuestUser = Subjects.CreateGuestUser;
  queueGroupName = queueGroupName;

  async onMessage(data: CreateGuestUserEvent['data'], msg: Message) {
    await User.create({
      _id: data._id,
      email: data.email,
      isGuestUser: true,
    });

    msg.ack();
  }
}
