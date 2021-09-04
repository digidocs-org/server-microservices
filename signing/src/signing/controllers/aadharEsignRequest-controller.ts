import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path'
import { decryptDocument, BadRequestError, fetchData } from '@digidocs/guardian';
import { createSignedXML, generateChecksum } from '@digidocs-org/rsa-crypt'
import { generateXml } from 'signing-service/utils';
import Document from 'signing-service/models/document'

export const aadharEsignRequest = async (req: Request, res: Response) => {
    // const documentUserMapId = req.documentUserMap?.id
    // const document = req.documentUserMap?.document as IDocument;
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

    const decryptedFile = decryptDocument(encryptedFile, publicKey);


    try {
        if (decryptedFile) {
            const pfxFilePath = path.resolve(__dirname + "/../key/digidocs-sign.pfx");
            const pfxFile = fs.readFileSync(pfxFilePath);
            const fileChecksum = generateChecksum(decryptedFile, "hex");
            const xml = generateXml({
                aspId: process.env.ASP_ID!,
                responseUrl: `${process.env.ESIGN_RESPONSE_URL!}?id=${documentId}`,
                checksum: fileChecksum
            })
            const signedXML = await createSignedXML({ pfxFile, password: process.env.PFX_FILE_PASS!, xml, rootElementName: 'Esign' })
            res.render('esignRequest', {
                esignRequestXMLData: signedXML
            })
        }
    } catch (error) {
        console.log(error)
        throw new BadRequestError("Error while parsing data!!!")
    }
}