import { Request, Response } from 'express';
import { decryptDocument, fetchData, exec, writeFile, SignTypes, readFile, deleteFile } from '@digidocs/guardian';
import { createJarSigningReq, generateToken, generateXml } from 'signing-service/utils';
import Document from 'signing-service/models/document';
import { EsignRequest, Files } from 'signing-service/types';
import User from 'signing-service/models/user';
import { createSignedXML, generateChecksum } from '@digidocs-org/rsa-crypt';

export const aadharEsignRequest = async (req: Request, res: Response) => {
    const documentId = req.body.documentId;
    const userId = req.currentUser?.id;
    const redirectUrl = req.body.redirectUrl

    const document = await Document.findById(documentId);
    if (!document) {
        return res.send({ type: "redirect", url: `${redirectUrl}?status=failed` })
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.send({ type: "redirect", url: `${redirectUrl}?status=failed` })
    }
    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const sign = await fetchData(process.env.SIGNATURE_URL!);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey);

    let signField = req.body.fieldData
    if (!signField || !signField?.length) {
        return res.send({ type: "redirect", url: `${redirectUrl}?status=failed` })
    }
    const signFieldData: EsignRequest = {
        name: `${user.firstname} ${user.lastname}`,
        location: "India",
        reason: "Aadhaar Sign",
        signatureFieldData: {
            data: signField
        }
    }

    const esignRequestField = createJarSigningReq(SignTypes.FIELD_REQUEST, signFieldData)
    const esignRequest = createJarSigningReq(SignTypes.ESIGN_REQUEST, signFieldData, esignRequestField.tempFileName);
    try {
        await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
        await writeFile(esignRequest.signImageFilePath, sign, 'base64');
        await exec(esignRequestField.signingRequest)
        await exec(esignRequest.signingRequest);
        const fieldData = await readFile(esignRequestField.fieldDataFilePath)
        const calTimeStamp = await readFile(esignRequest.timeStampFilePath);
        const unsignedFieldBuffer = await readFile(esignRequest.fieldDataFilePath);
        const pfxFile = await readFile(Files.pfxKey);
        const jwt = generateToken({
            documentId,
            userId: user._id,
            redirectUrl,
            calTimeStamp: calTimeStamp.toString(),
            fieldData
        },
            process.env.ESIGN_SALT!,
            process.env.ESIGN_SALT_EXPIRE!
        )

        const fileChecksum = generateChecksum(unsignedFieldBuffer, "hex");
        const xml = generateXml({
            aspId: process.env.ASP_ID!,
            responseUrl: `${process.env.ESIGN_RESPONSE_URL!}?data=${jwt}`,
            checksum: fileChecksum
        })
        const signedXML = await createSignedXML({ pfxFile, password: process.env.PFX_FILE_PASS!, xml })
        deleteFile(esignRequest.signedFilePath)
        return res.render('esignRequest', {
            esignRequestXMLData: signedXML
        })
    } catch (error) {
        deleteFile(esignRequest.signedFilePath);
        console.log(error)
        return res.send({ type: "redirect", url: `${redirectUrl}?status=failed` })
    }
}