import { COOKIE_OPTIONS } from '@digidocs/guardian';
import { Request, Response } from 'express';

export const signout = (req: Request, res: Response) => {
  res.clearCookie('session', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  // req.session.destroy();
  return res.send({ succes: true, message: 'Logged out successfully!' });
};
