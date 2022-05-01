import { IUserBody } from 'auth/types';
import User from 'auth/models';
import { BadRequestError, Templates } from '@digidocs/guardian';
import bcrypt from 'bcryptjs';
import { generateToken } from 'auth/utils';
import {
  UserCreatedPublisher,
  SendEmailPublisher,
} from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';

export class AuthService {
  public static async createUser(userData: IUserBody) {
    const { email, password, firstname, lastname } = userData;

    let user = await User.findOne({ email });
    if (user && !user.isGuestUser) {
      throw new BadRequestError('User already Exists!!');
    }

    if (!user) {
      user = await User.create({ email, firstname, lastname });
    }
    // hash pwd
    const salt = await bcrypt.genSalt(10);
    user.password = bcrypt.hashSync(password, salt);
    user.isPass = true;
    user.isGuestUser = false;

    const { id, __v } = user;

    const payload = {
      id,
      __v,
    };
    const accessToken = generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      process.env.ACCESS_TOKEN_EXP!
    );
    const refreshToken = generateToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET!,
      process.env.REFRESH_TOKEN_EXP!
    );
    user.refreshToken = refreshToken;
    await user.save();

    new UserCreatedPublisher(natsWrapper.client).publish({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      mobile: user.mobile,
      isBlocked: user.isBlocked,
      isPremium: user.isPremium,
      profileImage: user.profileImage,
      notificationId: user.notificationId,
      deviceId: user.deviceId,
      version: user.version,
    });

    new SendEmailPublisher(natsWrapper.client).publish({
      senderEmail: 'notifications@digidocs.one',
      clientEmail: user.email,
      subject: 'Welcome to Digidocs Esign',
      templateType: Templates.WELCOME,
      data: {
        user: user.firstname,
      },
    });

    return { accessToken, refreshToken };
  }

  public static async getUser(userId?: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new BadRequestError('User Not Found');
    }
    const userData = user.toJSON();
    delete userData.password;
    delete userData.refreshToken;
    delete userData.emailOtp;
    delete userData.forgetPasswordOtp;
    delete userData.version;

    return userData;
  }
}
