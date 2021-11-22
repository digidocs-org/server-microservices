import {
    headerValidators,
    bodyValidators,
    validateRequest,
} from '@digidocs/guardian';
import { Router } from 'express';
import {paymentDetails,paymentRequest} from 'payments-service/controllers'

export class DocumentRouter {
    private static router = Router();

    public static route() {

        /**
           * @Route   POST 'api/payment/request'
           * @Desc    Create a payment request
           * @Access  Private
           * @Returns {orderId,paymentId,status}
        */
        this.router.post(
            "/api/payment/request",
            bodyValidators("userId", "amount", "currency"),
            validateRequest,
            paymentRequest
        )

        /**
           * @Route   POST 'api/payments/details/:id'
           * @Desc    Create a payment request
           * @Access  Private
           * @Returns {orderId,paymentId,status}
        */
         this.router.get(
            "/api/payment/details/:orderId",
            paymentDetails
        )

        return this.router;
    }
}
