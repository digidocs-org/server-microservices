/* eslint-disable no-process-exit */
import { json, urlencoded } from 'express';
import { App } from '@digidocs/guardian';

import { DatabaseConfig } from './db-config';
import { natsWrapper } from './nats-wrapper';
import fileUpload from 'express-fileupload';
import { DocumentAuthorizationRouter } from './authorization/routes';
import { CreateDocumentListener } from './events/listeners/document-created-listener';
import { CreateUserListener } from './events/listeners/user-created-listener';

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
          new CreateDocumentListener(natsWrapper.client).listen();
          new CreateUserListener(natsWrapper.client).listen();
        });

      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed.');
        process.exit();
      });

      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());
    }

    this.app = new App(
      [DocumentAuthorizationRouter.route()],
      [json({ limit: '50mb' }), urlencoded({ extended: true })]
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
