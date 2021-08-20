import jwt from 'jsonwebtoken';
import { DecodedToken } from '../types';

export const generateToken = (
  payload: { id: string },
  salt: string,
  expire: string
): string =>
  jwt.sign(payload, salt, {
    expiresIn: expire,
  });


export const generateTimeBasedToken = (payload: DecodedToken, time: string) =>
  jwt.sign(payload, process.env.TIME_BASED_TOKEN_SECRET!, {
    expiresIn: time,
  });

  
