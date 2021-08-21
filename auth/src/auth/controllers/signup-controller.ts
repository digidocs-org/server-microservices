import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'auth/services';


export const Signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstname, lastname } = req.body;
  try {
    const user = await AuthService.createUser({
      email,
      password,
      firstname,
      lastname
    })
    return res.status(201).send(user);
  } catch (error) {
    return next(error)
  }
};