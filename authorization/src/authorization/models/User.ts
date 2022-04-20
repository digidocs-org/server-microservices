import mongoose, { Schema, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
/**
 *
 */
export interface IUser extends Document {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  mobile?: string;
  isBlocked: boolean;
  isPremium: boolean;
  profileImage?: string;
  notificationId?: string;
  deviceId?: string;
  aadhaarCredits: number;
  digitalSignCredits: number;
  version?: number;
  signUrl?: string
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
    aadhaarCredits: { type: Number, default: 0 },
    digitalSignCredits: { type: Number, default: 0 },
    signUrl: String
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

userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);

/**
 *
 */
export default mongoose.model<IUser>('user', userSchema);
