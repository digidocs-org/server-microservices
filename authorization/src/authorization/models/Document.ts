import mongoose, { Schema, Document } from 'mongoose';
import { DocumentStatus, SignTypes } from '@digidocs/guardian';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface IDocument extends Document {
  name: string;
  message?: string;
  inOrder?: boolean;
  publicKeyId: string;
  documentId: string;
  selfSign?: boolean;
  isDrafts?: boolean;
  status?: DocumentStatus;
  signType?: SignTypes;
  userId: string;
  validTill?: string;
  sendForSign?: boolean;
  timeToSign?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

const documentSchema: Schema = new Schema(
  {
    name: String,
    message: String,
    selfSign: { type: Boolean, default: false },
    inOrder: Boolean,
    isDrafts: Boolean,
    documentId: String,
    sendForSign: Boolean,
    publicKeyId: String,
    signType: String,
    status: String,
    userId: String,
    validTill: String,
    timeToSign: String,
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

documentSchema.set('versionKey', 'version');
documentSchema.plugin(updateIfCurrentPlugin);

export default mongoose.model<IDocument>('document', documentSchema);
