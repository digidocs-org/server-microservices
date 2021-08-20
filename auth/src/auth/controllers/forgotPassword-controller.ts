import { Request, Response } from 'express';
import crypto from 'crypto';
import { BadRequestError, ForbiddenError } from '@digidocs-org/guardian';
import User from '../models';
// import { sendEmailToClient } from '../../utils/email';
import { generateTimeBasedToken } from '../utils';

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
    //   sendEmailToClient({
    //     clientEmail: user.email,
    //     subject: 'Account Password Reset',
    //     body: `Your OTP for password change is: ${user.forgetPasswordOtp!.otp}`,
    //   });
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
            return res.send({
                success: true,
                token,
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
