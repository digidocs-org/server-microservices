import { Request, Response } from 'express'
import Document from 'signing-service/models/document'
import { BadRequestError, decryptDocument, deleteFile, fetchData, writeFile } from '@digidocs/guardian'
import {v4 as uuidv4} from 'uuid';
import {promisify} from 'util';
import { generateChecksum } from '@digidocs-org/rsa-crypt';
import {Files} from 'signing-service/types'

const exec = promisify(require('child_process').exec);
const convertToString = (str: string) => JSON.stringify(str);

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

    const jarFilePath = Files.javaUtility;
    const pfxFilePath = Files.pfxKey;
    const tempFileName = uuidv4();
    const unsignedFilePath = `./temp-${tempFileName}/unsigned.pdf`;
    const signedFilePath = `./temp-${tempFileName}/signed.pdf`;
    const signImageFilePath = `${__dirname}/../sign.jpeg`;
    

    const data = {
        esignResponse: convertToString(generateChecksum(decryptedFile,"hex")),
        tempUnsignedPdfPath: convertToString(unsignedFilePath),
        tempSignedPdfPath: convertToString(signedFilePath),
        signImageFile: convertToString(signImageFilePath),
        nameToShowOnStamp: convertToString('Naman Singh'),
        locationToShowOnStamp: convertToString('India'),
        reasonToShowOnStamp: convertToString('Digidocs Digital Sign'),
        pageNumberToInsertStamp: '1',
        xCoordinateOfStamp: '40',
        yCoordinateOfStamp: '60',
        pfxFilePath,
        pfxPass: convertToString(process.env.PFX_FILE_PASS!)
    };
    
    try {
        await writeFile(unsignedFilePath, decryptedFile, 'base64');
        const { stdout, stderr } = await exec(
            `java -jar ${jarFilePath} "DIGITAL_SIGN" ${data.esignResponse} ${data.tempUnsignedPdfPath} ${data.signImageFile} ${data.tempSignedPdfPath} ${data.nameToShowOnStamp} ${data.locationToShowOnStamp} ${data.reasonToShowOnStamp} ${data.pageNumberToInsertStamp} ${data.xCoordinateOfStamp} ${data.yCoordinateOfStamp} ${data.pfxFilePath} ${data.pfxPass}`
        );
        
        if (stderr) {
            // deleteFile(signedFilePath);
            return res.redirect('redirect?type=failed');
        }

        // deleteFile(signedFilePath);
        return res.redirect('redirect?type=failed');
    } catch (error) {
        console.log(error);
        // deleteFile(signedFilePath);
        return res.redirect('redirect?type=failed');
    }
}
