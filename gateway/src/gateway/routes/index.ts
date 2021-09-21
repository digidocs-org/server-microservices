import { Router } from 'express'
import authRouter from './auth-router'

export class ApiRouter {
  private static router = Router();

  public static route() {

    /**
     * @description Auth Router
     */
    this.router.use("/api/v1/auth", authRouter)

    return this.router;
  }
}