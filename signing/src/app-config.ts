import express from 'express';
import { App } from '@digidocs/guardian';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import { DatabaseConfig } from './db-config';
import { natsWrapper } from './nats-wrapper';
import { SigningRouter } from 'signing-service/routers';
import { CreateUserListener } from './events/listeners/user-created-listener';
import { CreateDocumentListener } from './events/listeners/document-created-listener';
import path from 'path';
import { CreateGuestUserListener } from './events/listeners/create-guest-user-listener';
import { UpdateDocumentListener } from './events/listeners/document-updated-listener';
import { UserUpdatedListener } from './events/listeners/user-updated-listener';

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
          new CreateDocumentListener(natsWrapper.client).listen();
          new CreateGuestUserListener(natsWrapper.client).listen();
          new UpdateDocumentListener(natsWrapper.client).listen();
          new UserUpdatedListener(natsWrapper.client).listen();
        });

      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed.');
        process.exit();
      });

      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());
    }

    this.app = new App(
      [SigningRouter.route()],
      [
        cors(),
        express.urlencoded({ extended: true }),
        express.json(),
        fileUpload(),
      ],
      [
        {
          viewPath: path.join(path.resolve(), 'src/signing/views'),
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
