import mongoose, { Schema, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface IContactUs extends Document {
    userName?: string
    userEmail?: string
    subject?: string
    userQuery?: string
    userMobile?: string
}

const auditTrailSchema = new Schema(
    {
        userName: { type: String },
        userEmail: { type: String },
        subject: { type: String },
        userQuery: { type: String },
        userMobile: { type: String },
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

auditTrailSchema.set('versionKey', 'version');
auditTrailSchema.plugin(updateIfCurrentPlugin);

const ContactUs = mongoose.model<IContactUs>('auditTrail', auditTrailSchema);

export default ContactUs;
