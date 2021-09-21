import { Router } from 'express'

export class ApiRouter {
  private static router = Router();

  public static route() {
    
    /**
     * @description Auth Router
     */
    this.router.use("/api/auth/signup")

    /**
     * @description Document Router
     */

    return this.router;
  }
}