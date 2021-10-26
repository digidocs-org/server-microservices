import { v4 as uuidv4 } from 'uuid';
import { checkForBuffer } from './file-service';
import { IUploadOptions } from '../types';

export const parseUploadData = (
    file: Buffer,
    publicKey: Buffer | string,
    userId: string
) => {
    const filesToUpload: Array<IUploadOptions> = [];

    const fileBuffer = checkForBuffer(file) ? file : Buffer.from(file);
    const publicKeyBuffer = checkForBuffer(publicKey)
        ? (publicKey as Buffer)
        : Buffer.from(publicKey);

    const fileName = uuidv4();
    const fileData: IUploadOptions = {
        mime: 'application/octet-stream',
        data: fileBuffer,
        length: fileBuffer.length,
        name: `${fileName}.aes`,
        key: `${userId}/documents/${fileName}.aes`,
    };
    filesToUpload.push(fileData);

    const keyName = uuidv4()
    const keyData: IUploadOptions = {
        mime: 'application/octet-stream',
        data: publicKeyBuffer,
        length: publicKeyBuffer.length,
        name: `${keyName}.pem`,
        key: `${userId}/keys/${keyName}.pem`,
    };
    filesToUpload.push(keyData);

    return filesToUpload;
};

export const parseSignatureUpload = (file: string, userId: string) => {
    const fileBuffer = Buffer.from(file);

    const filesToUpload: IUploadOptions = {
        mime: 'image/png',
        data: fileBuffer,
        length: fileBuffer.length,
        name: `${uuidv4()}.png`,
        key: `${userId}/signatures/${uuidv4()}.png`,
    };

    return filesToUpload;
};
