import { SendEmailListener } from 'src/events/listeners';
import { natsWrapper } from './nats-wrapper';
import { json, urlencoded } from 'express';
import { App } from '@digidocs/guardian';
import { DatabaseConfig } from './db-config';
import cors from 'cors';
import { NatoRouter } from './nato/routes';

export class Application {
  private app: App;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      natsWrapper
        .connect(
          process.env.NATS_CLUSTER_ID!,
          process.env.NATS_CLIENT_ID!,
          process.env.NATS_URI!
        )
        .then(() => {
          new SendEmailListener(natsWrapper.client).listen();
        });

      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed.');
        process.exit();
      });

      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());
    }

    this.app = new App(
      [
        cors({
          credentials: true,
          origin: [
            'https://accounts.digidocs.one',
            'https://stage.digidocs.one',
            'http://localhost:3000',
          ],
        }),
        json({ limit: '50mb' }),
        urlencoded({ extended: true }),
      ],
      [NatoRouter.route()],
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
