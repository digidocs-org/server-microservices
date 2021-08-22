import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { IUploadOptions, IUploadResponse } from '../types';

const S3 = new S3Client({
    region: 'ap-south-1',
});


export const uploadToS3Bucket = async (file: IUploadOptions) => {
    try {
        const params = {
            ACL: 'public-read',
            Body: file.data,
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: file.key,
            ContentLength: file.length,
            ContentType: file.mime,
        };
        await S3.send(new PutObjectCommand(params));
        return Promise.resolve({ name: file.name, key: file.key });
    } catch (error) {
        console.log(error);
        return Promise.reject('Cannot Upload Error Occured!!');
    }
};
