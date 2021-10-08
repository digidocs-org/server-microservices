import { Request, Response } from 'express';
import Document from 'signing-service/models/document';
import {
  decryptDocument,
  deleteFile,
  fetchData,
  writeFile,
  exec,
  SignTypes,
  encryptDocument,
  uploadToS3Bucket,
  readFile
} from '@digidocs/guardian';
import { createJarSigningReq, parseUploadData, verifyEsignResponse } from 'signing-service/utils';
import { AadharEsignPayload, EsignRequest, EsignResponse } from 'signing-service/types';
import jwt from 'jsonwebtoken'

export const esignCallback = async (req: Request, res: Response) => {
  const { espResponse, signingData } = req.body;
  const decodedData = jwt.verify(signingData, process.env.ESIGN_SALT!) as AadharEsignPayload
  const { documentId, docSignId, signTime } = decodedData
  const response = verifyEsignResponse(espResponse);
  if (response?.actionType == EsignResponse.CANCELLED) {
    return res.send('redirect?type=cancelled');
  }
  if (!documentId || !docSignId || signTime) {
    console.log("field missing")
    return res.send('redirect?type=failed');
  }

  const document = await Document.findById(documentId);
  if (!document) {
    console.log("document not found")
    return res.send('redirect?type=failed');
  }

  const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
  const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

  const encryptedFile = await fetchData(documentURL);
  const publicKeyBuffer = await fetchData(publicKeyURL);

  const publicKey = publicKeyBuffer.toString();
  const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

  const signFieldData: EsignRequest = {
    name: "Naman Singh",
    location: "India",
    reason: "Aadhar E-Sign",
    docId: docSignId,
    timeOfDocSign: signTime,
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
  const esignRequest = createJarSigningReq(__dirname, SignTypes.AADHAR_SIGN, signFieldData);

  try {
    await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
    await writeFile(esignRequest.responseTextFile, espResponse, 'utf-8');
    await exec(esignRequest.signingRequest);

    const dataBuffer = await readFile(esignRequest.signedFilePath)

    const { encryptedFile, publicKey } = encryptDocument(dataBuffer);
    const exportPublicKey = publicKey.export({
      format: 'pem',
      type: 'spki',
    });
    const parsedFiles = parseUploadData(encryptedFile, document.documentId, exportPublicKey, document.publicKeyId, document.userId);
    await Promise.all(parsedFiles.map((parsedFile) => uploadToS3Bucket(parsedFile)))
    

    deleteFile(esignRequest.signedFilePath);
    return res.send('redirect?type=success');
  } catch (error) {
    console.log(error);
    deleteFile(esignRequest.signedFilePath);
    return res.send('redirect?type=failed');
  }
};
