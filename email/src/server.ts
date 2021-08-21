import {Application} from './app-config';

if (!process.env.NODEMAILER_EMAIL) {
  throw new Error('JWT_KEY is required.');
}

if (!process.env.NODEMAILER_PASS) {
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

//initialise application
new Application();