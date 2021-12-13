import { Subjects, Listener, UserUpdatedEvent } from '@digidocs/guardian';
import { queueGroupName } from 'authorization-service/types';
import { Message } from 'node-nats-streaming';
import User from 'authorization-service/models/User';

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
    subject: Subjects.UserUpdated = Subjects.UserUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
        const user = await User.findById(data.id)
        if (!user) return;

        await user.updateOne({
            firstname: data.firstname ?? user.firstname,
            lastname: data.lastname ?? user.lastname,
            mobile: data.mobile ?? user.mobile,
            isBlocked: data.isBlocked ?? user.isBlocked,
            isPremium: data.isPremium ?? user.isPremium,
            profileImage: data.profileImage ?? user.profileImage,
            notificationId: data.notificationId ?? user.notificationId,
            deviceId: data.deviceId ?? user.deviceId,
            version: data.version ?? user.version,
            signUrl: data.signUrl ?? user.signUrl,
        })
        msg.ack();
    }
}
