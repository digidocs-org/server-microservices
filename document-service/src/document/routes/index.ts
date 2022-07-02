import { Router } from 'express';
import documentServiceRouter from './document-router';

export class DocumentServiceRouter {
  private static router = Router();

  public static route() {
    /**
     * @description Esign Router
     */
    this.router.use('/api/v1/document/', documentServiceRouter);

    return this.router;
  }
}
