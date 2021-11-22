import {
    headerValidators,
    bodyValidators,
    validateRequest,
} from '@digidocs/guardian';
import { Router } from 'express';
import { paymentDetails, paymentRequest, indexOrders } from 'payments-service/controllers'

export class PaymentRouter {
    private static router = Router();

    public static route() {

        /**
           * @Route   POST '/api/orders/payment/request'
           * @Desc    Create a payment request
           * @Access  Private
           * @Returns {orderId,paymentId,status}
        */
        this.router.post(
            "/api/orders/payment/request",
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
            "/api/orders/detail/:orderId",
            paymentDetails
        )

        /**
           * @Route   POST 'api/payments/index'
           * @Desc    Create a payment request
           * @Access  Private
           * @Returns {orderId,paymentId,status}
        */
        this.router.get(
            "/api/orders/index",
            headerValidators("userId"),
            validateRequest,
            indexOrders
        )

        return this.router;
    }
}
