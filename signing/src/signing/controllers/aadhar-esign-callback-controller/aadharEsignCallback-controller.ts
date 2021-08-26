import { Request, Response } from 'express';
import Document from 'signing-service/models/document'
import { decryptDocument, fetchData, writeFile } from '@digidocs/guardian';
import { verifyEsignResponse } from 'signing-service/utils';
import { EsignResponse } from 'signing-service/types';
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'

const exec = promisify(require('child_process').exec);


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

    const tempFileName = uuidv4()



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
        await writeFile(`temp-${tempFileName}/unsigned.pdf`, decryptedFile, "base64")

        const { stdout, stderr } = await exec(`java -jar ./java-utility-jar/eSign2.1 2 ${espXmlResponse} temp-${tempFileName}/unsigned.pdf "./tick.jpeg" 15 1 "Ganesh" "Pune" "Security" 40 60 150 50 "" "" 2>&1`)

        return res.redirect("redirect?type=failed")
    } catch (error) {
        return res.redirect("redirect?type=failed")
    }
}