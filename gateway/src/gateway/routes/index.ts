import { Router } from 'express';
import authRouter from './auth-router';
import { authorizationRedirect } from 'gateway/controllers/authorization-controller';

export class ApiRouter {
  private static router = Router();

  public static route() {
    /**
     * @description Auth Router
     */
    this.router.use('/api/v1/auth', authRouter);


    /**
     * @description authorization Router
     */
    this.router.all('/api/v1/authorization/*', authorizationRedirect);

    return this.router;
  }
}
