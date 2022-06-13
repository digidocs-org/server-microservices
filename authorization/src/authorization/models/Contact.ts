import mongoose, { Schema, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface IContactUs extends Document {
    userName?: string
    userEmail?: string
    subject?: string
    userQuery?: string
    userMobile?: string
}

const contactUsSchema = new Schema(
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

contactUsSchema.set('versionKey', 'version');
contactUsSchema.plugin(updateIfCurrentPlugin);

const ContactUs = mongoose.model<IContactUs>('contact-us', contactUsSchema);

export default ContactUs;
