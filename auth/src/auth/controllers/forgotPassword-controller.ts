import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  BadRequestError,
  COOKIE_OPTIONS,
  ForbiddenError,
  Templates,
} from '@digidocs/guardian';
import User from 'auth/models';
import { generateTimeBasedToken } from 'auth/utils';
import { SendEmailPublisher } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';

export const forgotPasswordOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  const currentTimeStamp = new Date().getTime();

  if (!user) {
    throw new BadRequestError('User not found!!!');
  }

  const secureRandom = crypto.randomInt(100000, 1000000);
  user.forgetPasswordOtp!.otp = secureRandom;
  user.forgetPasswordOtp!.expire = currentTimeStamp + 5 * 60000;
  new SendEmailPublisher(natsWrapper.client).publish({
    senderEmail: 'notifications@digidocs.one',
    clientEmail: user.email,
    subject: 'Account Password Reset',
    templateType: Templates.OTP,
    data: {
      title: 'Account Password Reset',
      subtitle: 'Your OTP for password change is',
      otp: user.forgetPasswordOtp!.otp,
    },
  });
  await user.save();
  return res.send({ success: true });
};

export const forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
  const { otp, email } = req.body;
  const user = await User.findOne({ email });
  const currentTimeStamp = new Date().getTime();

  if (!user) throw new BadRequestError('User not found!!!');

  if (
    user.forgetPasswordOtp &&
    user.forgetPasswordOtp.otp &&
    user.forgetPasswordOtp.expire
  ) {
    if (
      currentTimeStamp < user.forgetPasswordOtp?.expire &&
      otp == user.forgetPasswordOtp.otp
    ) {
      const token = generateTimeBasedToken(
        { id: user.id, type: 'otp', otp: otp },
        '5m'
      );
      res.cookie('reset-token', token, COOKIE_OPTIONS);
      return res.send({
        success: true,
        // token,
      });
    }
    if (
      currentTimeStamp > user.forgetPasswordOtp?.expire &&
      otp == user.forgetPasswordOtp.otp
    )
      throw new ForbiddenError('Otp Expired!!!');
  }
  throw new BadRequestError('OTP is invalid!!!');
};
