import { encryptToken } from '@digidocs/guardian';
import jwt from 'jsonwebtoken';

export const generateEncryptedToken = (userId: string) => {
  const payload = {
    id: userId,
  };

  const jwtToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);
  const encryptedToken = encryptToken(jwtToken);

  return encryptedToken;
};
