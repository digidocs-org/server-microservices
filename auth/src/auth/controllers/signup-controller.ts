import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { BadRequestError } from '@digidocs-org/guardian';

import User from '../models';
import { generateToken } from '../utils';


export const Signup = async (req: Request, res: Response) => {
    const { email, password, firstname, lastname } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      throw new BadRequestError('User already Exists!!');
    }
  
    user = new User({ email, firstname, lastname });
    // hash pwd
    const salt = await bcrypt.genSalt(10);
    user.password = bcrypt.hashSync(password, salt);
    user.isPass = true;
    await user.save();
  
    const { id, __v } = user;
  
    const payload = {
      id,
      __v,
    };
    const accessToken = generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      process.env.ACCESS_TOKEN_EXP!
    );
    const refreshToken = generateToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET!,
      process.env.REFRESH_TOKEN_EXP!
    );
    user.refreshToken = refreshToken;
    await user.save();
  
    res.json({ accessToken, refreshToken });
  };