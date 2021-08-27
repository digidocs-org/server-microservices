import { Request, Response } from 'express';
import Document from 'signing-service/models/document'
import { decryptDocument, fetchData, writeFile } from '@digidocs/guardian';
import { verifyEsignResponse } from 'signing-service/utils';
import { EsignResponse } from 'signing-service/types';
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'

const exec = promisify(require('child_process').exec);


export const esignCallback = async (req: Request, res: Response) => {
    console.log(req.body)
    const espXmlResponse = req.body.msg
    console.log(espXmlResponse)
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

    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

    const tempFileName = uuidv4()



    const data = {
        pdfFile: `./temp-${tempFileName}/unsigned.pdf`,
        signImageFile: '',
        serverTime: "15",
        pageNumberToInsertStamp: "1",
        nameToShowOnStamp: "Naman Singh",
        locationToShowOnStamp: "India",
        reasonToShowOnStamp: "Aadhar E-signature",
        xCoordinateOfStamp: "40",
        yCoordinateOfStamp: "60",
        stampWidth: "150",
        stampHeight: "100",
        finalPdfPath: `./temp-${tempFileName}`
    }

    try {
        await writeFile(`temp-${tempFileName}/unsigned.pdf`, decryptedFile, "base64")

        const { stdout, stderr } = await exec(`java -jar 
        ./java-utility-jar/eSign2.1 2 
        ${espXmlResponse} 
        ${data.pdfFile}
        "./tick.jpeg" 
        ${data.serverTime} 
        ${data.pageNumberToInsertStamp}
        ${data.nameToShowOnStamp}
        ${data.locationToShowOnStamp}
        ${data.reasonToShowOnStamp}
        ${data.xCoordinateOfStamp} ${data.yCoordinateOfStamp}
        ${data.stampWidth} ${data.stampHeight}
        "" 
        ${data.finalPdfPath} 2>&1`)

        if (stderr) {
            console.log(stderr)
            return res.redirect("redirect?type=failed")
        }

        return res.redirect("redirect?type=failed")
    } catch (error) {
        return res.redirect("redirect?type=failed")
    }
}