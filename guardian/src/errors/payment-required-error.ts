import { CustomError } from './custom-error';

export class PaymentRequiredError extends CustomError {
  statusCode = 402;
  data = {};

  constructor(public message: string, data?: any) {
    super(message);
    this.data = data;

    Object.setPrototypeOf(this, PaymentRequiredError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, data: this.data }];
  }
}
