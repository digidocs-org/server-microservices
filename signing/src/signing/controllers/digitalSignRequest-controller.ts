import { Request, Response } from 'express'
import { generateXMLToSign, createSignedXML } from '@digidocs-org/rsa-crypt'
import Document from 'signing-service/models/document'
import { BadRequestError, decryptDocument, fetchData } from '@digidocs/guardian'
import path from 'path'
import fs from 'fs'

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

    const decryptedFile = decryptDocument(encryptedFile, publicKey);
    try {
        if (decryptedFile) {
            const pfxFilePath = path.resolve(__dirname + "/../key/digidocs-sign.pfx");
            const pfxFile = fs.readFileSync(pfxFilePath);
            const xml = await generateXMLToSign({
                pfxFile: pfxFile,
                fileBuffer: decryptedFile,
                password: process.env.PFX_FILE_PASS!
            }) as string
            const signedXML = await createSignedXML({ pfxFile, password: process.env.PFX_FILE_PASS!, xml, rootElementName: "EsignResp" })
            console.log(signedXML)
        }
    } catch (error) {
        console.log(error)
        throw new BadRequestError("Error while parsing data!!!")
    }
}