import { Request, Response } from 'express';
import { BadRequestError } from '@digidocs/guardian';

import User from 'auth/models';

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    throw new BadRequestError('Cannot update the user profile!!!');
  }

  const newParams = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new BadRequestError('No user found!!!');
  }

  user.set({
    firstname: newParams.firstname || user.firstname,
    lastname: newParams.lastname || user.lastname,
  });

  await user.save();
  return res.send({ success: true });
};
