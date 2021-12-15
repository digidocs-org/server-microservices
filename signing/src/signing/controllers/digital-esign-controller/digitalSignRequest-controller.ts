import { Request, Response } from 'express'
import Document from 'signing-service/models/document'
import { BadRequestError, decryptDocument, deleteFile, encryptDocument, exec, fetchData, readFile, SignTypes, uploadToS3Bucket, writeFile } from '@digidocs/guardian'
import { createJarSigningReq, parseUploadData } from 'signing-service/utils';
import { EsignRequest } from 'signing-service/types';
import { EsignSuccess } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';
import User from 'signing-service/models/user'

export const digitalSignRequest = async (req: Request, res: Response) => {
    const documentId = req.body.documentId
    const userId = req.currentUser?.id
    const document = await Document.findById(documentId)
    const user = await User.findById(userId)
    if (!document) {
        throw new BadRequestError("Document not found!!!")
    }
    if (!userId || !user) {
        throw new BadRequestError("User not found!!!")
    }

    if(!user.signUrl){
        throw new BadRequestError("cannot find signature of user!!!")
    }

    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const sign = await fetchData(user.signUrl)
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

    let signField = req.body.fieldData
    if (!signField.length) {
        signField = [{
            dataX: 0,
            dataY: 0,
            height: 50,
            width: 150,
            pageNumber: 1,
        }]
    }
    const signFieldData: EsignRequest = {
        name: `${user.firstname} ${user.lastname}`,
        location: "India",
        reason: "Digital Sign",
        signatureFieldData: {
            data: signField
        }
    }
    
    const esignRequest = createJarSigningReq(SignTypes.DIGITAL_SIGN, signFieldData);
    console.log(esignRequest.signingRequest)
    try {
        await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
        await writeFile(esignRequest.signImageFilePath, sign, 'base64');
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
