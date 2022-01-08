import mongoose, { Schema, Document } from 'mongoose';
import {
  FieldName,
  ActionType,
  AuthType,
  FieldType,
  ActionStatus,
} from 'authorization-service/types';

export interface IActionFields {
  dataX: number
  dataY: number
  height: number
  width: number
  pageNumber: number
  recipientName: string
  recipientEmail: string
  dragTypeID: string
}

export interface IDocumentActions extends Document {
  type: ActionType;
  privateMessage: string;
  authType: AuthType;
  authCode: number;
  recipientEmail: string;
  actionStatus: ActionStatus;
  recipientName: string;
  signOrder: number;
  fields?: IActionFields[];
  aadhaarCredits: number;
  digitalSignCredits: number;
}

const actionSchema: Schema = new Schema(
  {
    type: { type: String, required: true },
    privateMessage: String,
    authType: String,
    authCode: Number,
    actionStatus: String,
    recipientName: String,
    recipientEmail: { type: String, required: true },
    signOrder: Number,
    aadhaarCredits: Number,
    digitalSignCredits: Number,
    fields: { type: Array, default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export default mongoose.model<IDocumentActions>('actions', actionSchema);
