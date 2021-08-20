import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services';


export const Signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstname, lastname } = req.body;
  try {
    const data = await AuthService.createUser({
      email,
      password,
      firstname,
      lastname
    })
    res.send(data);
  } catch (error) {
    return next()
  }
};