import mongoose, { Schema, Document } from 'mongoose';
import { DocumentStatus } from 'document-service/types';

export interface IDocument extends Document {
    name: string
    message?: string
    inOrder?: boolean
    publicKeyId: string
    documentId: string
    selfSign?: boolean
    isDrafts?: boolean
    status?: DocumentStatus
    userId: string
    validTill?: string
    timeToSign?: string
    createdAt: string
    updatedAt: string
}

const documentSchema: Schema = new Schema(
    {
        name: String,
        message: String,
        selfSign: { type: Boolean, default: false },
        inOrder: Boolean,
        isDrafts: Boolean,
        documentId: String,
        publicKeyId: String,
        status: String,
        userId: String,
        validTill: String,
        timeToSign: String,
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

export default mongoose.model<IDocument>('document', documentSchema);
