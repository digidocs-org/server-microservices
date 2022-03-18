import { Subjects, SendEmailEvent, Listener } from '@digidocs/guardian';
import { sendEmailToClient } from 'email-service/services';
import { queueGroupName } from 'email-service/types';
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
      console.log(data);
      msg.ack();
    }
  }
}
