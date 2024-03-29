import mongoose, { Schema, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
/**
 *
 */
export interface IUser extends Document {
  id: string
  email: string
  firstname: string
  isGuestUser: boolean
  googleId: string
  lastname: string
  mobile: string
  isBlocked: boolean
  isPremium: boolean
  profileImage: string
  emailOtp?: { otp: number | null; expire: number | null }
  forgetPasswordOtp?: { otp: number | null; expire: number | null }
  isPass: boolean
  isEmailVerified: boolean
  notificationId: string
  deviceId: string
  password?: string
  refreshToken?: string
  version?: number,
  aadhaarCredits: number,
  digitalSignCredits: number,
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
    isPass: { type: Boolean, default: false },
    lastname: String,
    mobile: { type: String },
    isPremium: { type: Boolean },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    googleId: String,
    profileImage: String,
    emailOtp: {
      otp: { type: Number, default: null },
      expire: { type: Number, default: null },
    },
    forgetPasswordOtp: {
      otp: { type: Number, default: null },
      expire: { type: Number, default: null },
    },
    notificationId: String,
    deviceId: String,
    password: String,
    refreshToken: String,
    version: Number,
    aadhaarCredits: { type: Number, default: 0 },
    digitalSignCredits: { type: Number, default: 0 },
    signUrl: String
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

userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);

/**
 *
 */
export default mongoose.model<IUser>('user', userSchema);
