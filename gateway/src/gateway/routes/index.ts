import { Router } from 'express'
import authRouter from './auth-router'
import esignRouter from './esign-router'

export class ApiRouter {
  private static router = Router();

  public static route() {

    /**
     * @description Auth Router
     */
    this.router.use("/api/v1/auth", authRouter)

    /**
     * @description Esign Router
     */
     this.router.use("/api/v1/esign", esignRouter)

    return this.router;
  }
}