import {
  CreditSuccessEvent,
  CreditType,
  Listener,
  Subjects,
} from '@digidocs/guardian';
import { queueGroupName } from 'auth/types';

import User from 'auth/models';
import { Message } from 'node-nats-streaming';

export class CreditSuccessListener extends Listener<CreditSuccessEvent> {
  subject: Subjects.CreditSuccess = Subjects.CreditSuccess;
  queueGroupName = queueGroupName;

  async onMessage(data: CreditSuccessEvent['data'], msg: Message) {
    const { userId, creditType, credits } = data;

    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    if (creditType === CreditType.AADHAR) {
      user.aadhaarCredits += credits;
    } else if (creditType === CreditType.DIGITAL) {
      user.digitalSignCredits += credits;
    }

    await user.save();
    msg.ack();
  }
}
