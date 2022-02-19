import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '@digidocs/guardian';

import User from 'auth/models';
import { generateToken } from 'auth/utils';

/**
 *
 * @param req
 * @param res
 */
export const refreshToken = async (req: Request, res: Response) => {
  let refreshToken = req.cookies['refreshToken'];

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new NotAuthorizedError();
  }

  interface UserPayload {
    id: string;
  }

  const payload = { id: '' };

  try {
    const decoded = jwt.verify(
      user.refreshToken!,
      process.env.REFRESH_TOKEN_SECRET!
    ) as UserPayload;
    payload.id = decoded.id;
  } catch (err) {
    throw new NotAuthorizedError();
  }

  const accessToken = generateToken(
    payload,
    process.env.ACCESS_TOKEN_SECRET!,
    process.env.ACCESS_TOKEN_EXP!
  );
  refreshToken = generateToken(
    payload,
    process.env.REFRESH_TOKEN_SECRET!,
    process.env.REFRESH_TOKEN_EXP!
  );
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken });
};
