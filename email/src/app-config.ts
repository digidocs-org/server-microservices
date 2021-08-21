import { SendEmailListener } from "email-service/events/listeners";
import { natsWrapper } from "./nats-wrapper";

export class Application {
    constructor() {
        if (process.env.NODE_ENV !== 'test') {
            natsWrapper.connect(
                process.env.NATS_CLUSTER_ID!,
                process.env.NATS_CLIENT_ID!,
                process.env.NATS_URI!
            ).then(() => {
                new SendEmailListener(natsWrapper.client).listen()
            });

            natsWrapper.client.on('close', () => {
                console.log('NATS connection closed.');
                process.exit();
            });
            
            process.on('SIGINT', () => natsWrapper.client.close());
            process.on('SIGTERM', () => natsWrapper.client.close());
        }
    }
}