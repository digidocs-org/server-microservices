import { json } from 'body-parser';
import { App } from '@digidocs/guardian';
import cookieSession from 'cookie-session';

import { DatabaseConfig } from './db-config';
import { natsWrapper } from './nats-wrapper';
import { DocumentRouter } from './document/routes';

export class Application {
    private app: App;

    constructor() {
        if (process.env.NODE_ENV !== 'test') {

            natsWrapper.connect(
                process.env.NATS_CLUSTER_ID!,
                process.env.NATS_CLIENT_ID!,
                process.env.NATS_URI!
            );

            natsWrapper.client.on('close', () => {
                console.log('NATS connection closed.');
                process.exit();
            });

            process.on('SIGINT', () => natsWrapper.client.close());
            process.on('SIGTERM', () => natsWrapper.client.close());

        }

        this.app = new App(
            [DocumentRouter.route()],
            [
                json(),
                cookieSession({
                    signed: false,
                    secure: process.env.NODE_ENV !== 'test',
                }),
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