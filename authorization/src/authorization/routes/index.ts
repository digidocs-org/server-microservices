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
    this.router.use('/api/authorization/esign', esignRouter);

    /**
     * @description Document Router
     */
    this.router.use('api/authorization/document', documentRouter);

    /**
    * @description Document Router
    */
    this.router.use('api/authorization/recipient', documentRouter);

    return this.router;
  }
}
