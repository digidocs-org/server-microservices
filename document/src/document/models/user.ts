import mongoose, { Schema, Document, mongo } from 'mongoose';
/**
 *
 */
export interface IUser extends Document {
    id: string
    email: string
    firstname: string
    lastname: string
    mobile?: string
    isBlocked: boolean
    isPremium: boolean
    profileImage?: string
    notificationId?: string
    deviceId?: string
    version?: number
}
/**
 *
 */
const userSchema: Schema = new Schema(
    {
        email: { type: String, required: true },
        firstname: String,
        isGuestUser: { type: Boolean, default: false },
        lastname: String,
        mobile: { type: String },
        isPremium: { type: Boolean },
        isBlocked: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
        profileImage: String,
        deviceId: String,
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

/**
 *
 */
export default mongoose.model<IUser>('user', userSchema);
