import { Subjects, Listener, UserCreatedEvent } from '@digidocs/guardian';
import { queueGroupName } from 'authorization-service/types';
import { Message } from 'node-nats-streaming';
import User from 'authorization-service/models/User';

export class CreateUserListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    try {
      await User.create({
        _id: data.id,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        mobile: data.mobile,
        isBlocked: data.isBlocked,
        isPremium: data.isPremium,
        profileImage: data.profileImage,
        notificationId: data.notificationId,
        deviceId: data.deviceId,
        version: data.version,
      });
      msg.ack();
    } catch (error) {
      console.log(error);
      msg.ack();
    }
  }
}
