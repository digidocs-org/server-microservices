import { Request, Response } from 'express';
import { decryptDocument, BadRequestError, fetchData, exec, writeFile, SignTypes, readFile, deleteFile } from '@digidocs/guardian';
import { createJarSigningReq, generateToken } from 'signing-service/utils';
import Document from 'signing-service/models/document';
import { EsignRequest } from 'signing-service/types';
import User from 'signing-service/models/user';
import { v4 as uuidv4 } from 'uuid'

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
                }
            ]
        }
    }

    let fieldData = "";
    signFieldData.signatureFieldData?.data.map(field => {
        fieldData += `${field.pageNo}-${field.xCoord},${field.yCoord},50,150;`
    })
    const fileName = `temp-${uuidv4()}`;
    const jwt = generateToken({
        documentId,
        userId: user._id,
        fileName
    },
        process.env.ESIGN_SALT!,
        process.env.ESIGN_SALT_EXPIRE!
    )

    const esignRequest = createJarSigningReq(SignTypes.ESIGN_REQUEST, signFieldData, fileName, `${process.env.ESIGN_RESPONSE_URL!}?data=${jwt}`);
    try {
        await writeFile(esignRequest.fieldDataFilePath, fieldData, 'utf-8');
        await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
        await exec(esignRequest.signingRequest);
        const signedXML = await readFile(esignRequest.requestXmlFilePath)

        // return res.send("success")
        return res.render('esignRequest', {
            esignRequestXMLData: signedXML.toString()
        })
    } catch (error) {
        deleteFile(esignRequest.signedFilePath);
        console.log(error)
        return res.send('redirect?type=failed');
    }
}