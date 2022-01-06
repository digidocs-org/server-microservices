import {
  CreditUpdateEvent,
  CreditUpdateType,
  Listener,
  Subjects,
} from '@digidocs/guardian';
import { queueGroupName } from 'auth/types';

import User from 'auth/models';
import { Message } from 'node-nats-streaming';

export class CreditUpdateListener extends Listener<CreditUpdateEvent> {
  subject: Subjects.CreditUpdate = Subjects.CreditUpdate;
  queueGroupName = queueGroupName;

  async onMessage(data: CreditUpdateEvent['data'], msg: Message) {
    const { userId, data: creditData, type } = data;
    const { aadhaarCredits, digitalSignCredits } = creditData
    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    if (type == CreditUpdateType.ADD) {
      user.aadhaarCredits = user.aadhaarCredits + (aadhaarCredits ?? 0)
      user.digitalSignCredits = user.digitalSignCredits + (digitalSignCredits ?? 0)
    } else if (type == CreditUpdateType.DECREASE) {
      user.aadhaarCredits = user.aadhaarCredits - (aadhaarCredits ?? 0)
      user.digitalSignCredits = user.digitalSignCredits - (digitalSignCredits ?? 0)
    }

    await user.save();
    msg.ack();
  }
}
