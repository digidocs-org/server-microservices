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
  const { documentId, fileName, userId } = decodedData
  const response = verifyEsignResponse(espResponse);
  if (response?.actionType == EsignResponse.CANCELLED) {
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  }
  const user = await User.findById(userId)

  if (!documentId || !fileName || !userId || !user) {
    console.log("field missing")
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  }

  const document = await Document.findById(documentId);
  if (!document) {
    console.log("document not found")
    return res.send(`${process.env.REDIRECT_URI}?type=success`);
  }

  const signFieldData: EsignRequest = {
    name: `${user.firstname} ${user.lastname}`,
    location: "India",
    reason: "Aadhaar Sign",
  }

  const esignRequest = createJarSigningReq(SignTypes.AADHAR_SIGN, signFieldData, fileName );
  console.log(esignRequest.signingRequest)

  try {
    await writeFile(esignRequest.responseTextFile, espResponse, 'utf-8');
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
