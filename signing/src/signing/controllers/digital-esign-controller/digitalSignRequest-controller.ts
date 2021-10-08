import { Request, Response } from 'express'
import Document from 'signing-service/models/document'
import { BadRequestError, decryptDocument, deleteFile, encryptDocument, exec, fetchData, readFile, SignTypes, uploadToS3Bucket, writeFile } from '@digidocs/guardian'
import { createJarSigningReq, parseUploadData } from 'signing-service/utils';
import crypto from 'crypto'
import { EsignRequest } from 'signing-service/types';
import { EsignSuccess } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';

export const digitalSignRequest = async (req: Request, res: Response) => {
    const documentId = req.params.id

    const document = await Document.findById(documentId)
    if (!document) {
        throw new BadRequestError("Document not found!!!")
    }

    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

    const timeOfDocSign = new Date().toString();
    const docId = crypto.randomInt(100000, 1000000);

    const signFieldData: EsignRequest = {
        name: "Naman Singh",
        location: "India",
        reason: "Aadhar E-Sign",
        docId,
        timeOfDocSign,
        signatureFieldData: {
            data: [
                {
                    pageNo: 1,
                    xCoord: 50,
                    yCoord: 50
                }
            ]
        }
    }
    const esignRequest = createJarSigningReq(__dirname, SignTypes.DIGITAL_SIGN, signFieldData);


    try {
        await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
        await exec(esignRequest.signingRequest);

        const dataBuffer = await readFile(esignRequest.signedFilePath)
        const { encryptedFile, publicKey } = encryptDocument(dataBuffer);
        const exportPublicKey = publicKey.export({
            format: 'pem',
            type: 'spki',
        });
        const parsedFiles = parseUploadData(encryptedFile, document.documentId, exportPublicKey, document.publicKeyId, document.userId);
        await Promise.all(parsedFiles.map((parsedFile) => uploadToS3Bucket(parsedFile)))
        new EsignSuccess(natsWrapper.client).publish({
            type: SignTypes.DIGITAL_SIGN
        })

        deleteFile(esignRequest.signedFilePath);
        return res.send('redirect?type=failed');
    } catch (error) {
        console.log(error);
        deleteFile(esignRequest.signedFilePath);
        return res.redirect('redirect?type=failed');
    }
}
