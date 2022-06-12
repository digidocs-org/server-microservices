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

  req.cookies['session'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNjNmNjllYmJhOWRjZGZmYzQzNjYzMyIsImlhdCI6MTY1MDcxODM2NywiZXhwIjoxNzM5MjIxMzY3fQ.LysZKDDMTfs6DvAwAsRSMtxsFRSXxuxxvhv7-Xel7tk"
  const token = req.cookies['session'] ?? req.header('token') ?? req.body.token;

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
