import { json, urlencoded } from 'express';
import { App } from '@digidocs/guardian';
import fileUpload from 'express-fileupload';

import cors from 'cors';
import { DatabaseConfig } from './db-config';
import { natsWrapper } from './nats-wrapper';
import { AuthRouter } from './auth/routes';
import passport from 'passport';
import passportInit from 'auth/services/passport';
import {
  CreateGuestUserListener,
  CreditUpdateListener,
} from './events/listeners';

export class Application {
  private app: App;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      passportInit();

      natsWrapper
        .connect(
          process.env.NATS_CLUSTER_ID!,
          process.env.NATS_CLIENT_ID!,
          process.env.NATS_URI!
        )
        .then(() => {
          new CreateGuestUserListener(natsWrapper.client).listen();
          new CreditUpdateListener(natsWrapper.client).listen();
        });

      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed.');
        // eslint-disable-next-line no-process-exit
        process.exit();
      });

      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());
    }

    this.app = new App(
      [AuthRouter.route()],
      [
        cors({
          credentials: true,
          origin: [
            'https://accounts.digidocs.one',
            'https://stage.digidocs.one',
            'https://app.digidocs.one',
            'http://localhost:3000',
          ],
        }),
        json(),
        urlencoded({ extended: true }),
        fileUpload(),
        passport.initialize(),
      ]
    );
  }

  public async start(portNumber: number) {
    await DatabaseConfig.connect();
    this.app.start(portNumber);
  }

  public getApp() {
    return this.app.getApp();
  }
}
