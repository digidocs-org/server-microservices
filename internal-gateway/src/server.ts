import { Application } from './app-config';

if (!process.env.PORT) {
  throw new Error('PORT is required.');
}

if (!process.env.DOCUMENT_SERVICE) {
  throw new Error('DOCUMENT_SERVICE is required.');
}

if (!process.env.PAYMENT_SERVICE) {
  throw new Error('PAYMENT_SERVICE is required.');
}

if (!process.env.SIGNING_SERVICE) {
  throw new Error('SIGNING_SERVICE is required');
}

if (!process.env.NATO_SERVICE) {
  throw new Error('NATO_SERVICE is required.');
}

if (!process.env.AUTH_SERVICE) {
  throw new Error('AUTH_SERVICE is required.');
}

const application = new Application();
application.start(parseInt(process.env.PORT));
