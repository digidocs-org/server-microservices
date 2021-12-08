import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from 'payments-service/types';

interface BillingInfo {
  userName: string
  address: string
  contactNumber: string
  city: string
  pincode: string
  state: string
  email: string
}

export interface IPaymentOrders extends Document {
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  userId: string;
  failureMessage: string;
  trackingId: string;
  paymentMode: string;
  modeName: string;
  billingInfo: BillingInfo
}

const paymentSchema: Schema = new Schema(
  {
    orderId: String,
    status: String,
    amount: Number,
    currency: String,
    userId: String,
    failureMessage: String,
    trackingId: String,
    billingInfo: Object,
    paymentMode: String,
    modeName: String
  },
  {
    timestamps: { createdAt: true, updatedAt: true }, toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    }
  }
);

export default mongoose.model<IPaymentOrders>('payment-orders', paymentSchema);
