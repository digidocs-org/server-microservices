import { Request, Response } from 'express'
import Document from 'signing-service/models/document'
import { BadRequestError, decryptDocument, deleteFile, exec, fetchData, SignTypes, writeFile } from '@digidocs/guardian'
import { createJarSigningReq } from 'signing-service/utils';
import crypto from 'crypto'
import { EsignRequest } from 'signing-service/types';

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

        // deleteFile(signedFilePath);
        return res.redirect('redirect?type=failed');
    } catch (error) {
        console.log(error);
        // deleteFile(signedFilePath);
        return res.redirect('redirect?type=failed');
    }
}
