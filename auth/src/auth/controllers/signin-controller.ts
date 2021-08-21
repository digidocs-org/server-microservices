import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { BadRequestError } from '@digidocs/guardian';

import User from 'auth/models';
import { generateToken } from 'auth/utils';


export const Signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError('Bad Credentials!!');
  }

  if (!user.isPass) {
    throw new BadRequestError('Bad Credentials!!');
  }
  const isPwdMatch = await bcrypt.compare(password, user.password!);
  if (!isPwdMatch) {
    throw new BadRequestError('Bad Credentials!!');
  }
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

  res.json({ accessToken, refreshToken });
};

export const googlePassport = (req: Request, res: Response) => {
  const accessToken = encodeURIComponent(req?.user?.accessToken!);
  const refreshToken = encodeURIComponent(req?.user?.refreshToken!);
  return res.redirect(
    `${process.env.CLIENT_URL}/login?accessToken=${accessToken}&refreshToken=${refreshToken}`
  );
};