import mongoose, { Schema, Document } from 'mongoose';
import { DocumentStatus } from '@digidocs/guardian';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

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
    version: number
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

documentSchema.set('versionKey', 'version');
documentSchema.plugin(updateIfCurrentPlugin);

export default mongoose.model<IDocument>('document', documentSchema);
