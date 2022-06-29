import { Subjects, SendEmailEvent, Listener } from '@digidocs/guardian';
import { sendEmailToClient } from 'nato-service/services';
import { queueGroupName } from 'nato-service/types';
import { Message } from 'node-nats-streaming';

export class SendEmailListener extends Listener<SendEmailEvent> {
  subject: Subjects.SendEmail = Subjects.SendEmail;
  queueGroupName = queueGroupName;

  async onMessage(data: SendEmailEvent['data'], msg: Message) {
    try {
      sendEmailToClient(data);
      msg.ack();
    } catch (error) {
      console.log(error);
      msg.ack();
    }
  }
}
