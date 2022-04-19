import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import User from 'auth/models';

const updatePassword = async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    throw new NotAuthorizedError();
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotAuthorizedError();
  }

  let { currentPassword, newPassword } = req.body;

  const salt = await bcrypt.genSalt(10);
  const isPwdMatch = await bcrypt.compare(currentPassword, user.password!);
  newPassword = bcrypt.hashSync(newPassword, salt);

  if (isPwdMatch) {
    user.set({
      password: newPassword,
    });
    await user.save();
  } else {
    throw new BadRequestError('Please enter the correct password!!');
  }

  return res.send({ success: true });
};

export default updatePassword;
