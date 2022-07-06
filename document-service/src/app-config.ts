/* eslint-disable no-process-exit */
import cors from 'cors';
import { json, urlencoded } from 'express';
import fileUpload from 'express-fileupload';

import { App } from '@digidocs/guardian';

import { DatabaseConfig } from 'document-service/db-config';
import { natsWrapper } from 'document-service/nats-wrapper';
import { DocumentServiceRouter } from 'document-service/document/routes';
import {
  CreateUserListener,
  EsignSuccessListener,
  UserUpdatedListener,
} from 'document-service/events';

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
          new EsignSuccessListener(natsWrapper.client).listen();
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
        fileUpload(),
      ],
      [DocumentServiceRouter.route()],
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
