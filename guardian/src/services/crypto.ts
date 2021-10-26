import {
    generateRSAkeys,
    generateChecksum,
    encryptChecksum,
    encryptFile,
    decryptFile,
    verifyFileAndChecksum,
} from '@digidocs-org/rsa-crypt';
import crypto from 'crypto';

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
