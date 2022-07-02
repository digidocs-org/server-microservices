import mongoose, { Schema, Document } from 'mongoose';
import { ActionType, AuthType, ActionStatus } from '@digidocs/guardian';

export interface IActionFields {
  dataX: number;
  dataY: number;
  height: number;
  width: number;
  pageNumber: number;
  recipientName: string;
  recipientEmail: string;
  dragTypeID: string;
}

export interface IDocumentActions extends Document {
  type: ActionType;
  privateMessage: string;
  viewOn: Date;
  view: Boolean;
  authType: AuthType;
  authCode: number;
  recipientEmail: string;
  actionStatus: ActionStatus;
  recipientName: string;
  signOrder: number;
  fields?: IActionFields[];
}

const actionSchema: Schema = new Schema(
  {
    type: String,
    privateMessage: String,
    authType: String,
    authCode: Number,
    actionStatus: String,
    recipientName: String,
    viewOn: Date,
    view: Boolean,
    recipientEmail: String,
    signOrder: Number,
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

const Action = mongoose.model<IDocumentActions>('actions', actionSchema);

export default Action;
