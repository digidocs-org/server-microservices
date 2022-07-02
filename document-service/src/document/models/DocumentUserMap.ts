/* eslint-disable no-param-reassign */
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IDocument } from './Document';
import { IDocumentActions } from './Actions';
import { IAuditTrail } from './AuditTrail';

export interface IDocumentUserMap extends Document {
  user: IUser | string;
  document: IDocument | string;
  access: boolean;
  auditTrail?: IAuditTrail | string;
  action?: IDocumentActions | string;
}

const documentUserMapSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },

    document: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'document',
    },

    action: {
      type: Schema.Types.ObjectId,
      ref: 'actions',
    },

    auditTrail: {
      type: Schema.Types.ObjectId,
      ref: 'auditTrail',
    },

    access: {
      type: Boolean,
      required: true,
    },
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

const DocumentUserMap = mongoose.model<IDocumentUserMap>(
  'document_user_map',
  documentUserMapSchema
);

export default DocumentUserMap;
