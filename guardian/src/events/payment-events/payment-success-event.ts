import { Subjects } from '../subjects';

export interface PaymentSuccessEvent {
    subject: Subjects.PaymentSuccess;
    data: {
        orderId: string
        userId: string
        data: any
    };
}