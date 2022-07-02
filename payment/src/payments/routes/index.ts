import {
  headerValidators,
  bodyValidators,
  validateRequest,
} from '@digidocs/guardian';
import { Router } from 'express';
import {
  paymentDetails,
  paymentRequest,
  indexOrders,
  paymentCallback,
} from 'payments-service/controllers';

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
      '/api/v1/orders/payment/request',
      bodyValidators(
        'user',
        'amount',
        'currency',
        'token',
        'callbackUrl',
        'redirectUrl'
      ),
      validateRequest,
      paymentRequest
    );

    /**
     * @Route   POST 'api/payments/details/:id'
     * @Desc    Create a payment request
     * @Access  Private
     */
    this.router.post(
      '/api/v1/orders/detail',
      bodyValidators('orderId'),
      validateRequest,
      paymentDetails
    );

    /**
     * @Route   POST 'api/payments/index'
     * @Desc    index payments
     * @Access  Private
     */
    this.router.post(
      '/api/v1/orders/index',
      bodyValidators('userId'),
      validateRequest,
      indexOrders
    );

    /**
     * @Route   POST 'api/payments/callback'
     * @Desc    index payments
     * @Access  Private
     */
    this.router.post('/api/v1/orders/payments/callback', paymentCallback);

    return this.router;
  }
}
