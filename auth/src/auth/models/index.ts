import mongoose, { Schema, Document } from 'mongoose';
/**
 *
 */
export interface IUser extends Document {
  id: string
  email: string
  firstname: string
  isGuestUser: boolean
  socialAuthToken?: string
  googleId: string
  lastname: string
  mobile: string
  isBlocked: boolean
  promoCode: string
  installLocation: string
  isPremium: boolean
  currentLocation: string
  profileImage: string
  emailOtp?: { otp: number | null; expire: number | null }
  forgetPasswordOtp?: { otp: number | null; expire: number | null }
  isPass: boolean
  isEmailVerified: boolean
  notificationId: string
  deviceId: string
  password?: string
  refreshToken?: string
  iat: number
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
    socialAuthToken: String,
    lastname: String,
    mobile: { type: String },
    isPremium: { type: Boolean },
    isBlocked: { type: Boolean, default: false },
    promoCode: String,
    isEmailVerified: { type: Boolean, default: false },
    installLocation: String,
    googleId: String,
    currentLocation: String,
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
