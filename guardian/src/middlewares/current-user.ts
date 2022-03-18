import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface UserPayload {
  id: string;
  email: string;
  iat: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      session?: any;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.cookies['session'] ?? req.header('token') ?? req.body.token;

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserPayload;
    req.currentUser = payload;
    req.headers['token'] = token;
  } catch (err) {
    console.log(err);
    res.clearCookie('session');
  }

  next();
};
