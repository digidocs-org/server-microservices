import { Request, Response } from 'express';
import crypto from 'crypto';
import User from 'auth/models';
// import { sendEmailToClient } from 'auth/utils';
import { BadRequestError, Templates } from '@digidocs/guardian';
import { SendEmailPublisher } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';

export const sendOTPEmail = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.currentUser?.id);
    const currentTimeStamp = new Date().getTime();

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const secureRandom = crypto.randomInt(100000, 1000000);
    user.emailOtp!.otp = secureRandom;
    user.emailOtp!.expire = currentTimeStamp + 10 * 60000;
    new SendEmailPublisher(natsWrapper.client).publish({
      clientEmail: user.email,
      subject: 'Email Verificaion',
      templateType: Templates.OTP,
      data: {
        title: 'Email Verificaion',
        subtitle: 'Hi, the OTP for email verification is',
        otp: secureRandom,
      },
    });
    await user.save();
    return res.send({ success: true });
  } catch (error) {
    throw new BadRequestError('Something Went Wrong!!!');
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { otp } = req.body;
  let user = await User.findById(req.currentUser?.id);
  const currentTimeStamp = new Date().getTime();

  if (!user) throw new BadRequestError('User not found!!!');

  if (user?.emailOtp && user.emailOtp?.expire && user.emailOtp?.otp) {
    if (currentTimeStamp < user.emailOtp?.expire && otp == user.emailOtp.otp) {
      user.emailOtp = { expire: null, otp: null };
      user.isEmailVerified = true;
      await user.save();
      return res.send({ success: true });
    }
    throw new BadRequestError('OTP is invalid or expired');
  }
  throw new BadRequestError('OTP is invalid or expired');
};
