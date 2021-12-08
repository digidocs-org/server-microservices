import { Publisher, Subjects, PaymentSuccessEvent} from '@digidocs/guardian'

export class PaymentSuccessPublisher extends Publisher<PaymentSuccessEvent> {
    subject: Subjects.PaymentSuccess = Subjects.PaymentSuccess;
}
