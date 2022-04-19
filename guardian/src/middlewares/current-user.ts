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
  req.cookies.session = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNWQxMjM4ZDYyYzU3ODdkNDYyYWE1YyIsImlhdCI6MTY1MDI2NjY4MCwiZXhwIjoxNzM4NzY5NjgwfQ.FCae0YeXnUZg7boSzB96jzFeJ46typz6NL713JBMVgk"
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
