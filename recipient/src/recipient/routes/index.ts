import {Router} from 'express';
import getRecipients from '../controllers/get-recipients';

export class RecipientRouter {
  private static router = Router();

  public static route() {
    this.router.get('/api/document/:id/recipient', getRecipients);

    return this.router;
  }
}
