import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from 'payments-service/types';


export interface IPaymentOrders extends Document {
  orderId: string;
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  userId: string;
}

const paymentSchema: Schema = new Schema(
  {
    orderId: String,
    paymentId : String,
    status: String,
    amount: Number,
    currency: String,
    userId: String
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
