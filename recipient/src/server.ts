import {Application} from './app-config';

if (!process.env.PORT) {
  throw new Error('PORT is required.');
}

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('JWT_KEY is required.');
}

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is required.');
}

if (!process.env.NATS_CLIENT_ID) {
  throw new Error('NATS_CLIENT_ID is required.');
}

if (!process.env.NATS_URI) {
  throw new Error('NATS_URI is required.');
}

if (!process.env.NATS_CLUSTER_ID) {
  throw new Error('NATS_CLUSTER_ID is required.');
}

if (!process.env.TIME_BASED_TOKEN_SECRET) {
  throw new Error('TIME_BASED_TOKEN_SECRET is required.');
}

const application = new Application();
application.start(parseInt(process.env.PORT));
