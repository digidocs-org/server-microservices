import { json } from 'body-parser';
import { App } from '@digidocs/guardian';
import fileUpload from 'express-fileupload';
import { ApiRouter } from 'gateway/routes'


export class Application {
    private app: App;

    constructor() {
        this.app = new App(
            [ApiRouter.route()],
            [
                json(),
                fileUpload()
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
