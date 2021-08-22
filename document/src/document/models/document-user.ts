/* eslint-disable no-param-reassign */
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user';
import { IDocument } from './document';
import { IDocumentActions } from './actions';

export interface IDocumentUserMap extends Document {
    user: IUser | string;
    document: IDocument | string;
    access: boolean;
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

export default mongoose.model<IDocumentUserMap>(
    'document_user_map',
    documentUserMapSchema
);
