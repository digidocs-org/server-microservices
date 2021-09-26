import { Request, Response } from 'express';
import Document from 'signing-service/models/document';
import {
  decryptDocument,
  deleteFile,
  fetchData,
  writeFile,
  exec,
  SignTypes
} from '@digidocs/guardian';
import { createJarSigningReq, verifyEsignResponse } from 'signing-service/utils';
import { AadharEsignPayload, EsignRequest, EsignResponse } from 'signing-service/types';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'

export const esignCallback = async (req: Request, res: Response) => {
  const { espXmlResponse, signingData } = req.body;
  const decodedData = jwt.verify(signingData, process.env.ESIGN_SALT!) as AadharEsignPayload
  console.log(decodedData)
  const response = verifyEsignResponse(espXmlResponse);
  if (response?.actionType == EsignResponse.CANCELLED) {
    return res.send('redirect?type=cancelled');
  }
  const documentId = req.query.id;
  const document = await Document.findById(documentId);
  if (!document) {
    console.log('not found document');
    return res.send('redirect?type=failed');
  }

  const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
  const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

  const encryptedFile = await fetchData(documentURL);
  const publicKeyBuffer = await fetchData(publicKeyURL);

  const publicKey = publicKeyBuffer.toString();
  const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

  //TODO: Import time and doc id from the docUserMap 
  const timeOfDocSign = new Date().toString();
  const docId = crypto.randomInt(100000, 1000000);

  const signFieldData: EsignRequest = {
    name: "Naman Singh",
    location: "India",
    reason: "Aadhar E-Sign",
    docId,
    timeOfDocSign,
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
    await writeFile(esignRequest.responseTextFile, espXmlResponse, 'utf-8');
    await exec(esignRequest.signingRequest);


    // deleteFile(signedFilePath);
    return res.send('redirect?type=success');
  } catch (error) {
    console.log(error);
    deleteFile(esignRequest.signedFilePath);
    return res.send('redirect?type=failed');
  }
};
