import {
  CreditSuccessEvent,
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
    const { userId, data: creditData } = data;
    const { aadhaarCredits, digitalSignCredits } = creditData
    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    if (user.aadhaarCredits) {
      user.aadhaarCredits += aadhaarCredits
    } else {
      user.aadhaarCredits = aadhaarCredits
    }

    if (user.digitalSignCredits) {
      user.digitalSignCredits += digitalSignCredits
    } else {
      user.digitalSignCredits = digitalSignCredits
    }

    await user.save();
    msg.ack();
  }
}
