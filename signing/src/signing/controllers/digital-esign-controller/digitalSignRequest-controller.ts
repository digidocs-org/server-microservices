import { Request, Response } from 'express'
import Document from 'signing-service/models/document'
import { BadRequestError, decryptDocument, deleteFile, encryptDocument, exec, fetchData, readFile, SignTypes, uploadToS3Bucket, writeFile } from '@digidocs/guardian'
import { createJarSigningReq, parseUploadData } from 'signing-service/utils';
import crypto from 'crypto'
import { EsignRequest } from 'signing-service/types';
import { EsignSuccess } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';
import { v4 as uuidv4 } from 'uuid'

export const digitalSignRequest = async (req: Request, res: Response) => {
    const documentId = req.body.documentId
    const userId = req.currentUser?.id
    const document = await Document.findById(documentId)
    if (!document) {
        throw new BadRequestError("Document not found!!!")
    }
    if (!userId) {
        throw new BadRequestError("User not found!!!")
    }

    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

    const signFieldData: EsignRequest = {
        name: "Naman Singh",
        location: "India",
        reason: "Aadhar E-Sign",
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
    const fileName = `temp-${uuidv4()}`;
    const esignRequest = createJarSigningReq(SignTypes.DIGITAL_SIGN, signFieldData, fileName);

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
            type: SignTypes.DIGITAL_SIGN,
            userId: userId,
            docId: documentId
        })

        deleteFile(esignRequest.signedFilePath);
        return res.send({ success: true, msg: "document signed successfully!!" });
    } catch (error) {
        console.log(error);
        deleteFile(esignRequest.signedFilePath);
        return res.send({ success: false, msg: "document siging failed!!" });
    }
}
