/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-namespace */
import { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { BadRequestError, NotAuthorizedError } from '@digidocs-org/guardian';
import User from '../models';

export interface DecodedToken {
    id: string
    type: string
    otp?: string | number
}

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header('reset-token');
    try {
        const decoded = jwt.verify(
            token!,
            process.env.TIME_BASED_TOKEN_SECRET!
        ) as DecodedToken

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new BadRequestError('User not found!!!');
        }
        if (user.forgetPasswordOtp?.otp != decoded.otp) throw new BadRequestError("Invalid token!!!")
        req.currentUser = user;
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new NotAuthorizedError()
        }
        throw new BadRequestError('Token not valid!!');
    }

    next();
};
