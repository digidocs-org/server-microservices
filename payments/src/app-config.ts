import { json } from 'express';
import { App } from '@digidocs/guardian';

import { DatabaseConfig } from './db-config';
import cors from 'cors'
import { natsWrapper } from './nats-wrapper';
import { PaymentRouter } from './payments/routes';
import path from 'path';

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
          //Add payment listeners here

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
      [PaymentRouter.route()],
      [cors(), json({ limit: '50mb' })],
      [
        {
          viewPath: path.join(path.resolve(), 'src/payments/views'),
          engine: 'ejs',
        },
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
