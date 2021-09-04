import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';

import Document from 'document-service/models/document';
import DocumentUserMap from 'document-service/models/document-user';
import {
    encryptDocument, IUploadOptions,
    uploadToS3Bucket,
    IUploadResponse,
    checkForBase64String,
    checkForPdf,
    checkForProtectedPdf,
    BadRequestError,
    parseUploadData
} from '@digidocs/guardian'
import { DocumentStatus } from '@digidocs/guardian';
import { CreateDocumentPublisher } from 'src/events/publishers/create-document-publisher';
import { natsWrapper } from 'src/nats-wrapper';

export const createDocument = async (req: Request, res: Response) => {
    const ownerId = req.currentUser?.id;

    // Fetch the document from request
    const { files } = req;

    if (!files) {
        throw new BadRequestError('Please upload a PDF file!');
    }

    if (files && Object.keys(files).length > 1) {
        throw new BadRequestError('Multilpe files upload is not allowed!');
    }

    // eslint-disable-next-line prefer-destructuring
    const file = files.file as UploadedFile;

    const fileData = file.data;
    const fileName = file.name;

    if (!file || !checkForPdf(fileData)) {
        throw new BadRequestError('Please upload a PDF file!');
    }

    if (req.body.file && !checkForBase64String(req.body.file)) {
        throw new BadRequestError('Not a valid file!');
    }

    const isPasswordProtected = await checkForProtectedPdf(fileData);

    if (isPasswordProtected) {
        throw new BadRequestError('Cannot upload password protected file!');
    }

    // Encrypt the document.
    const { encryptedFile, publicKey } = encryptDocument(fileData);

    // Export public key.
    const exportPublicKey = publicKey.export({
        format: 'pem',
        type: 'spki',
    });

    const parsedFiles = parseUploadData(encryptedFile, exportPublicKey, ownerId!);

    // Upload document and key to s3.
    Promise.all<IUploadResponse>(parsedFiles.map((parsedFile: IUploadOptions) => uploadToS3Bucket(parsedFile)))
        .then(async (data) => {
            const documentID = data[0].name;
            const publicKeyID = data[1].name;

            // Add the document in Document schema
            const document = await Document.create({
                name: fileName,
                documentId: documentID,
                publicKeyId: publicKeyID,
                status: DocumentStatus.DRAFTS,
                isDrafts: true,
                userId: ownerId,
            });

            // Add the owner permission in Document User Map Schema.
            await DocumentUserMap.create({
                user: ownerId,
                document: document.id,
                access: true,
            });

            new CreateDocumentPublisher(natsWrapper.client).publish({
                id: document.id,
                name: document.name,
                message: document.message,
                inOrder: document.inOrder,
                publicKeyId: document.publicKeyId,
                documentId: document.documentId,
                selfSign: document.selfSign,
                isDrafts: document.isDrafts,
                status: document.status,
                userId: document.userId,
                validTill: document.validTill,
                timeToSign: document.timeToSign,
                version: document.version,
            })

            return res.send({ success: true, data: { id: document.id } });
        })
        .catch((err) => {
            console.log(err);
            throw new BadRequestError('Upload failed!!!');
        });
};
