import { Request, Response } from 'express';
import { decryptDocument, BadRequestError, fetchData, exec, writeFile, deleteFile, SignTypes, readFile } from '@digidocs/guardian';
import { createSignedXML, generateChecksum } from '@digidocs-org/rsa-crypt';
import { createJarSigningReq, generateXml } from 'signing-service/utils';
import Document from 'signing-service/models/document';
import { EsignRequest, Files } from 'signing-service/types';
import crypto from 'crypto'

export const aadharEsignRequest = async (req: Request, res: Response) => {
    // const documentUserMapId = req.documentUserMap?.id
    // const document = req.documentUserMap?.document as IDocument;
    const documentId = req.body.documentId;

    const document = await Document.findById(documentId);
    if (!document) {
        throw new BadRequestError('Document not found!!!');
    }
    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey);
    const timeOfDocSign = new Date().toString();
    const docId = crypto.randomInt(100000, 1000000)

    const signFieldData: EsignRequest = {
        name: "Naman Singh",
        location: "India",
        reason: "Aadhar E-Sign",
        timeOfDocSign,
        docId,
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

    const esignRequest = createJarSigningReq(__dirname, SignTypes.ESIGN_REQUEST, signFieldData);

    try {
        await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
        await exec(esignRequest.signingRequest);

        const unsignedFieldBuffer = await readFile(esignRequest.unsignedFieldPath);

        const pfxFile = await readFile(Files.pfxKey);
        const fileChecksum = generateChecksum(unsignedFieldBuffer, "hex");
        const xml = generateXml({
            aspId: process.env.ASP_ID!,
            responseUrl: `${process.env.ESIGN_RESPONSE_URL!}?id=${documentId}`,
            checksum: fileChecksum
        })
        const signedXML = await createSignedXML({ pfxFile, password: process.env.PFX_FILE_PASS!, xml })
        //TODO: create a field in documentUserMap for time of signing and documentId
        //TODO: create a field in documentUserMap for docId 
        deleteFile(esignRequest.signedFilePath);
        return res.render('esignRequest', {
            esignRequestXMLData: signedXML
        })
    } catch (error) {
        deleteFile(esignRequest.signedFilePath);
        console.log(error)
        return res.send('redirect?type=failed');
    }
}
