import { Request, Response } from 'express';

export const signout = (req: Request, res: Response) => {
  res.clearCookie('session');
  res.clearCookie('refreshToken');
  return res.send({ succes: true, message: 'Logged out successfully!' });
};
