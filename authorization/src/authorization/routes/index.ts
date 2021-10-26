import { Router } from 'express';
import esignRouter from './esign-router';
import documentRouter from './document-router';
import recipientRouter from './recipient-router'

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

    return this.router;
  }
}