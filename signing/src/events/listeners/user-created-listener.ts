import { Subjects, Listener, UserCreatedEvent } from '@digidocs/guardian';
import { queueGroupName } from 'signing-service/types'
import { Message } from 'node-nats-streaming';
import User from 'signing-service/models/user'

export class CreateUserListener extends Listener<UserCreatedEvent>{
    subject: Subjects.UserCreated = Subjects.UserCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserCreatedEvent['data'], msg: Message) {
        try {
            const user = await User.create({
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
            })
            msg.ack()
        } catch (error) {
            console.log(error)
            msg.ack()
        }
    }
}