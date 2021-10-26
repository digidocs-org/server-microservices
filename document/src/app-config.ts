import { json } from 'express';
import { App } from '@digidocs/guardian';

import { DatabaseConfig } from './db-config';
import cors from 'cors'
import { natsWrapper } from './nats-wrapper';
import { DocumentRouter } from './document/routes';
import { CreateUserListener } from './events/listeners/user-created-listener';
import fileUpload from 'express-fileupload';
import { CreateGuestUserListener } from './events/listeners/create-guest-user-listener';
import SendDocumentListener from './events/listeners/send-document-listener';

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
          new CreateUserListener(natsWrapper.client).listen();
          new CreateGuestUserListener(natsWrapper.client).listen();
          new SendDocumentListener(natsWrapper.client).listen();
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
      [DocumentRouter.route()],
      [cors(),json({ limit: '50mb' }), fileUpload()]
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
