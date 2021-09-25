import { Application } from './app-config';

if(!process.env.PORT){
    throw new Error('Port is required');
}

if(!process.env.AUTH_SERVICE_BASE_URL){
    throw new Error('AUTH_SERVICE_BASE_URL is required');
}

if(!process.env.ESIGN_SERVICE_BASE_URL){
    throw new Error('ESIGN_SERVICE_BASE_URL is required');
}

const application = new Application();
application.start(parseInt(process.env.PORT));
