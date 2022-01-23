import { NotAuthorizedError, decryptToken } from '@digidocs/guardian';
import { NextFunction, Request, Response } from 'express';

export const queryTokenAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.session?.jwt &&
    !req.header('token') &&
    !req.body.token &&
    req.query.token
  ) {
    req.headers.token = decryptToken(req.query.token.toString());
  }
  next();
};
