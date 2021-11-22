import {
    headerValidators,
    bodyValidators,
    validateRequest,
    currentUser,
} from '@digidocs/guardian';
import { Router } from 'express';



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

        )

        /**
           * @Route   POST 'api/payments/details/:id'
           * @Desc    Create a payment request
           * @Access  Private
           * @Returns {orderId,paymentId,status}
        */
         this.router.get(
            "/api/payment/details/:orderId",
            
        )

        return this.router;
    }
}
