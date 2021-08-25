import { Request, Response } from 'express';
import Document from 'signing-service/models/document'
import { decryptDocument, fetchData } from '@digidocs/guardian';
import { verifyEsignResponse } from 'signing-service/utils';
import { EsignResponse } from 'signing-service/types';


export const esignCallback = async (req: Request, res: Response) => {
    const espXmlResponse = req.body.msg
    const response = verifyEsignResponse(espXmlResponse)
    if (response?.actionType == EsignResponse.CANCELLED) {
        return res.redirect("redirect?type=cancelled")
    }
    const documentId = req.query.id
    const document = await Document.findById(documentId)
    if (!document) {
        return res.redirect("redirect?type=failed")
    }

    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;
    const signatureURL = `${process.env.CLOUDFRONT_URI}/signature/signature.jpeg`

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const signatureBuffer = await fetchData(signatureURL);

    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;


    const esignRequest = {
        eSignXMLData: espXmlResponse,
        pdfBuffer: decryptedFile.toString("base64"),
        signImageBuffer: signatureBuffer.toString("base64"),
        serverTime: "15",
        pageNumberToInsertStamp: "1",
        nameToShowOnStamp: "Naman Singh",
        locationToShowOnStamp: "India",
        reasonToShowOnStamp: "Aadhar E-signature",
        xCoordinateOfStamp: "40",
        yCoordinateOfStamp: "60",
        stampWidth: "150",
        stampHeight: "50"
    }

    try {


        return res.redirect("redirect?type=failed")
    } catch (error) {
        return res.redirect("redirect?type=failed")
    }
}