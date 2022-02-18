import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'auth/services';
import { COOKIE_OPTIONS } from '@digidocs/guardian';

export const Signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstname, lastname } = req.body;
  try {
    const user = await AuthService.createUser({
      email,
      password,
      firstname,
      lastname,
    });
    res.cookie('session', user.accessToken, COOKIE_OPTIONS);
    return res.status(201).send(user);
  } catch (error) {
    return next(error);
  }
};
