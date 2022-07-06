/* eslint-disable no-process-exit */
import cors from 'cors';
import { json, urlencoded } from 'express';
import fileUpload from 'express-fileupload';

import { App } from '@digidocs/guardian';


export class Application {
  private app: App;

  constructor() {
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
      ]
    );
  }

  public async start(portNumber: number) {
    this.app.start(portNumber);
  }

  public getApp() {
    return this.app.getApp();
  }
}
