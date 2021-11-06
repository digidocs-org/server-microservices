import { Request, Response } from 'express';
import { decryptDocument, BadRequestError, fetchData, exec, writeFile, deleteFile, SignTypes, readFile } from '@digidocs/guardian';
import { createSignedXML, generateChecksum } from '@digidocs-org/rsa-crypt';
import { createJarSigningReq, generateXml, generateToken } from 'signing-service/utils';
import Document from 'signing-service/models/document';
import { EsignRequest, Files } from 'signing-service/types';
import crypto from 'crypto'
import User from 'signing-service/models/user';

export const aadharEsignRequest = async (req: Request, res: Response) => {
    const documentId = req.body.documentId;
    const userId = req.currentUser?.id;

    const document = await Document.findById(documentId);
    if (!document) {
        throw new BadRequestError('Document not found!!!');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new BadRequestError("User not found!!!")
    }
    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey);

    const signFieldData: EsignRequest = {
        name: `${user.firstname} ${user.lastname}`,
        location: "India",
        reason: "Aadhaar Sign",
        signatureFieldData: {
            data: [
                {
                    pageNo: 1,
                    xCoord: 50,
                    yCoord: 50
                },
                {
                    pageNo: 2,
                    xCoord: 70,
                    yCoord: 50
                },
                {
                    pageNo: 3,
                    xCoord: 100,
                    yCoord: 50
                }
            ]
        }
    }

    let fieldData = "";
    signFieldData.signatureFieldData.data.map(field=>{
        fieldData += `${field.pageNo}-${field.xCoord},${field.yCoord},50,150;`
    })

    const esignRequest = createJarSigningReq(__dirname, SignTypes.ESIGN_REQUEST, signFieldData);

    try {
        await writeFile(esignRequest.fieldDataFilePath, fieldData, 'utf-8');
        await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
        await exec(esignRequest.signingRequest);

        const unsignedFieldBuffer = await readFile(esignRequest.unsignedFieldPath);
        const timeStamp = await readFile(esignRequest.timeStampFilePath);

        const pfxFile = await readFile(Files.pfxKey);
        const fileChecksum = generateChecksum(unsignedFieldBuffer, "hex");

        console.log(fileChecksum)
        const jwt = generateToken({
            documentId,
            signTime: timeStamp.toString(),
            userId: user._id
        },
            process.env.ESIGN_SALT!,
            process.env.ESIGN_SALT_EXPIRE!
        )

        const xml = generateXml({
            aspId: process.env.ASP_ID!,
            responseUrl: `${process.env.ESIGN_RESPONSE_URL!}?data=${jwt}`,
            checksum: fileChecksum
        })
        const signedXML = await createSignedXML({ pfxFile, password: process.env.PFX_FILE_PASS!, xml })
        // deleteFile(esignRequest.signedFilePath);
        // return res.send("success")
        return res.render('esignRequest', {
            esignRequestXMLData: signedXML
        })
    } catch (error) {
        // deleteFile(esignRequest.signedFilePath);
        console.log(error)
        return res.send('redirect?type=failed');
    }
}
