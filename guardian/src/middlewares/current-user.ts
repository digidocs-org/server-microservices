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
  let token = req.session?.jwt ?? req.header('token') ?? req.body.token;

  try {
    const payload = jwt.verify(
      token ?? req.session?.jwt,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {
    console.log(err);
    req.session = null;
  }

  next();
};
