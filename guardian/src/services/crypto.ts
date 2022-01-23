import {
  generateRSAkeys,
  generateChecksum,
  encryptChecksum,
  encryptFile,
  decryptFile,
  verifyFileAndChecksum,
} from '@digidocs-org/rsa-crypt';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-ecb';
const SECRET = process.env.ENCRYPTION_SECRET;
const INIT_VECTOR = Buffer.from('');

export const encryptDocument = (file: Buffer | string) => {
  const { publicKey, privateKey } = generateRSAkeys();
  if (typeof file === 'string') {
    file = Buffer.from(file, 'base64');
  }
  const fileChecksum = generateChecksum(file);
  const encryptedChecksum = encryptChecksum(fileChecksum, privateKey);

  const encryptedFile = encryptFile(
    file,
    encryptedChecksum,
    Buffer.from(process.env.FILE_KEY!, 'base64')
  );
  return { encryptedFile, publicKey };
};

export const decryptDocument = (
  file: Buffer,
  publicKey: string | crypto.KeyObject
) => {
  const decryptedData = decryptFile(
    file,
    publicKey,
    Buffer.from(process.env.FILE_KEY!, 'base64')
  );
  const { decryptedBuffer, decryptedChecksum } = decryptedData;
  const isVerified = verifyFileAndChecksum(decryptedBuffer, decryptedChecksum);

  if (!isVerified) {
    return false;
  }
  return decryptedBuffer;
};

export const decryptToken = (token: string) => {
  const cipher = crypto.createDecipheriv(ALGORITHM, SECRET!, INIT_VECTOR!);
  let decryptedToken = cipher.update(token, 'hex', 'utf-8');
  decryptedToken += cipher.final('utf8');

  return decryptedToken;
};

export const encryptToken = (token: string) => {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET!, INIT_VECTOR!);
  let encryptedToken = cipher.update(token, 'utf-8', 'hex');
  encryptedToken += cipher.final('hex');

  return encryptedToken;
};
