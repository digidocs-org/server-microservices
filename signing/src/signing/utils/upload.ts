import { IUploadOptions, checkForBuffer } from '@digidocs/guardian';

export const parseUploadData = (
    file: Buffer,
    fileName: string,
    publicKey: Buffer | string,
    publicKeyName: string,
    userId: string
) => {
    const filesToUpload: Array<IUploadOptions> = [];

    const fileBuffer = checkForBuffer(file) ? file : Buffer.from(file);
    const publicKeyBuffer = checkForBuffer(publicKey)
        ? (publicKey as Buffer)
        : Buffer.from(publicKey);

    const fileData: IUploadOptions = {
        mime: 'application/octet-stream',
        data: fileBuffer,
        length: fileBuffer.length,
        name: `${fileName}.aes`,
        key: `${userId}/documents/${fileName}`,
    };
    filesToUpload.push(fileData);

    const keyData: IUploadOptions = {
        mime: 'application/octet-stream',
        data: publicKeyBuffer,
        length: publicKeyBuffer.length,
        name: `${publicKeyName}.pem`,
        key: `${userId}/keys/${publicKeyName}`,
    };
    filesToUpload.push(keyData);

    return filesToUpload;
};
