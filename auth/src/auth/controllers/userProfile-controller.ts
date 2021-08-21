/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { BadRequestError } from '@digidocs/guardian';
import { AuthService } from 'auth/services';
// import { sendEmailToClient } from 'auth/auth/utils/email';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.currentUser?.id
    const userInfo = await AuthService.getUser(userId)
    return res.status(201).send(userInfo);
  } catch (error) {
    return next(error)
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = req.userData;

  if (!user) {
    throw new BadRequestError("User Not Found")
  }

  const salt = await bcrypt.genSalt(10);
  user.password = bcrypt.hashSync(password, salt);
  user.forgetPasswordOtp = { otp: null, expire: null };
  user.isPass = true;
  user.__v = user.__v ? user.__v++ : 1;
  await user.save();
  //   sendEmailToClient({
  //     clientEmail: user.email,
  //     subject: 'Password Reset Successful',
  //     body: 'Hi,\nYour password has been reset successfully',
  //   });
  res.send({ success: true });
};
