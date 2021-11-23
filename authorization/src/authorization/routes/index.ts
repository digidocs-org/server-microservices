import { Router } from 'express';
import esignRouter from './esign-router';
import documentRouter from './document-router';
import recipientRouter from './recipient-router'
import paymentRouter from './payment-router'

export class DocumentAuthorizationRouter {
  private static router = Router();

  public static route() {
    /**
     * @description Esign Router
     */
    this.router.use('/api/v1/authorization/esign', esignRouter);

    /**
     * @description Document Router
     */
    this.router.use('/api/v1/authorization/document', documentRouter);

    /**
    * @description Document Router
    */
    this.router.use('/api/v1/authorization/recipient', recipientRouter);

    /**
    * @description Payment Router
    */
    this.router.use('/api/v1/authorization/orders', paymentRouter);

    return this.router;
  }
}