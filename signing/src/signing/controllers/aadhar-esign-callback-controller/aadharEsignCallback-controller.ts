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
import { EsignSuccess } from 'src/events/publishers';
import { natsWrapper } from 'src/nats-wrapper';
import User from 'signing-service/models/user'

export const esignCallback = async (req: Request, res: Response) => {
  const { espResponse, signingData } = req.body;
  const decodedData = jwt.verify(signingData, process.env.ESIGN_SALT!) as AadharEsignPayload
  const { documentId, signTime, userId } = decodedData
  const response = verifyEsignResponse(espResponse);
  if (response?.actionType == EsignResponse.CANCELLED) {
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  }
  const user = await User.findById(userId)

  if (!documentId || !signTime || !userId || !user) {
    console.log("field missing")
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  }

  const document = await Document.findById(documentId);
  if (!document) {
    console.log("document not found")
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  }

  const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
  const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

  const encryptedFile = await fetchData(documentURL);
  const publicKeyBuffer = await fetchData(publicKeyURL);

  const publicKey = publicKeyBuffer.toString();
  const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

  const signFieldData: EsignRequest = {
    name: `${user.firstname} ${user.lastname}`,
    location: "India",
    reason: "Aadhar E-Sign",
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
  signFieldData.signatureFieldData.data.map(field => {
    fieldData += `${field.pageNo}-${field.xCoord},${field.yCoord},50,150;`
  })

  const esignRequest = createJarSigningReq(__dirname, SignTypes.AADHAR_SIGN, signFieldData);
  console.log(esignRequest.signingRequest)

  try {
    await writeFile(esignRequest.fieldDataFilePath, fieldData, 'utf-8');
    await writeFile(esignRequest.unsignedFilePath, decryptedFile, 'base64');
    await writeFile(esignRequest.responseTextFile, espResponse, 'utf-8');
    await writeFile(esignRequest.timeStampFilePath, signTime, 'utf-8');
    await exec(esignRequest.signingRequest);

    // const dataBuffer = await readFile(esignRequest.signedFilePath)

    // const { encryptedFile, publicKey } = encryptDocument(dataBuffer);
    // const exportPublicKey = publicKey.export({
    //   format: 'pem',
    //   type: 'spki',
    // });
    // const parsedFiles = parseUploadData(encryptedFile, document.documentId, exportPublicKey, document.publicKeyId, document.userId);
    // await Promise.all(parsedFiles.map((parsedFile) => uploadToS3Bucket(parsedFile)))
    // new EsignSuccess(natsWrapper.client).publish({
    //   type: SignTypes.AADHAR_SIGN,
    //   userId: userId,
    //   docId: documentId
    // })

    // deleteFile(esignRequest.signedFilePath);
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  } catch (error) {
    console.log(error);
    deleteFile(esignRequest.signedFilePath);
    return res.send(`${process.env.REDIRECT_URI}?type=failed`);
  }
};
