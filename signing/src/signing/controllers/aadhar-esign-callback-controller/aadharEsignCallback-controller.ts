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
import { AadhaarSigningData, AadharEsignPayload, EsignRequest, EsignResponse } from 'signing-service/types';
import jwt from 'jsonwebtoken'
import { EsignSuccess } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';
import User from 'signing-service/models/user'

export const esignCallback = async (req: Request, res: Response) => {
  const { espResponse, signingData } = req.body;

  const decodedData = jwt.verify(signingData, process.env.ESIGN_SALT!) as AadharEsignPayload
  const { documentId, userId, redirectUrl, calTimeStamp, fieldData: signField } = decodedData
  const response = verifyEsignResponse(espResponse);
  if (response?.actionType == EsignResponse.CANCELLED) {
    return res.send(`${redirectUrl}?status=cancelled`);
  }
  const user = await User.findById(userId)

  if (!documentId || !userId || !user || !redirectUrl || !calTimeStamp || !signField || !user.signUrl) {
    return res.send(`${redirectUrl}?status=failed`);
  }
  const document = await Document.findById(documentId);
  if (!document) {
    return res.send(`${redirectUrl}?status=failed`);
  }

  const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
  const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

  const encryptedFile = await fetchData(documentURL);
  const publicKeyBuffer = await fetchData(publicKeyURL);
  const sign = await fetchData(process.env.SIGNATURE_URL!)

  const publicKey = publicKeyBuffer.toString();
  const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

  const signFieldData: EsignRequest = {
    name: `${user.firstname} ${user.lastname}`,
    signatureFieldData: {
      data: signField
    }
  }

  const aadhaarSigningData: AadhaarSigningData = {
    timestamp: calTimeStamp
  }

  const esignRequest = createJarSigningReq(SignTypes.AADHAAR_SIGN, signFieldData, aadhaarSigningData);

  try {
    await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
    await writeFile(esignRequest.signImageFilePath, sign, 'base64');
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
    new EsignSuccess(natsWrapper.client).publish({
      type: SignTypes.AADHAR_SIGN,
      userId: userId,
      docId: documentId
    })

    deleteFile(esignRequest.signedFilePath);
    return res.send(`${redirectUrl}?status=success`);
  } catch (error) {
    console.log(error);
    deleteFile(esignRequest.signedFilePath);
    return res.send(`${redirectUrl}?status=failed`);
  }
};
