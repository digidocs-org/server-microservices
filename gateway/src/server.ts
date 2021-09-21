import { Application } from './app-config';

if(!process.env.PORT){
    throw new Error('Port is required');
}

const application = new Application();
application.start(parseInt(process.env.PORT));
