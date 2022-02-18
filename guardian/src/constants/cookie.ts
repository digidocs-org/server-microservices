import { CookieOptions } from 'express';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: false,
  domain: 'digidocs.one',
  secure: true,
  sameSite: 'none',
  maxAge: new Date().setFullYear(new Date().getFullYear() + 2),
};
