import {Request, Response, NextFunction} from 'express';
import {NotAuthorizedError} from '../errors/not-authorized-error';

interface UserPayload {
  id: string;
  email: string;
  iat: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session?: any;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};
