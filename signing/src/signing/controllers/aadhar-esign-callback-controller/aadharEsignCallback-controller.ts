import {Request, Response} from 'express';
import Document from 'signing-service/models/document';
import {
  decryptDocument,
  deleteFile,
  fetchData,
  writeFile,
} from '@digidocs/guardian';
import {verifyEsignResponse} from 'signing-service/utils';
import {EsignResponse} from 'signing-service/types';
import {v4 as uuidv4} from 'uuid';
import {promisify} from 'util';

const exec = promisify(require('child_process').exec);
const convertToString = (str: string) => JSON.stringify(str);

export const esignCallback = async (req: Request, res: Response) => {
  const espXmlResponse = req.body.msg;
  const response = verifyEsignResponse(espXmlResponse);
  if (response?.actionType == EsignResponse.CANCELLED) {
    return res.redirect('redirect?type=cancelled');
  }
  const documentId = req.query.id;
  const document = await Document.findById(documentId);
  if (!document) {
    console.log('not found document');
    return res.redirect('redirect?type=failed');
  }

  const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
  const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

  const encryptedFile = await fetchData(documentURL);
  const publicKeyBuffer = await fetchData(publicKeyURL);

  const publicKey = publicKeyBuffer.toString();
  const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

  const tempFileName = uuidv4();
  const jarFilePath = `${__dirname}/"java-utility-jar/esign-java-utility.jar"`;
  const unsignedFilePath = `${__dirname}/temp-${tempFileName}/unsigned.pdf`;
  const signedFilePath = `${__dirname}/temp-${tempFileName}/signed.pdf`;
  const signImageFilePath = `${__dirname}/sign.jpeg`;

  const data = {
    esignResponse: convertToString(espXmlResponse),
    tempUnsignedPdfPath: convertToString(unsignedFilePath),
    tempSignedPdfPath: convertToString(signedFilePath),
    signImageFile: convertToString(signImageFilePath),
    nameToShowOnStamp: convertToString('Naman Singh'),
    locationToShowOnStamp: convertToString('India'),
    reasonToShowOnStamp: convertToString('Aadhar E-signature'),
    pageNumberToInsertStamp: '1',
    xCoordinateOfStamp: '40',
    yCoordinateOfStamp: '60',
  };

  try {
    await writeFile(unsignedFilePath, decryptedFile, 'base64');
    const {stdout, stderr} = await exec(
      `java -jar ${jarFilePath} ${data.esignResponse} ${data.tempUnsignedPdfPath} ${data.signImageFile} ${data.tempSignedPdfPath} ${data.nameToShowOnStamp} ${data.locationToShowOnStamp} ${data.reasonToShowOnStamp} ${data.pageNumberToInsertStamp} ${data.xCoordinateOfStamp} ${data.yCoordinateOfStamp}`
    );
    if (stderr) {
      deleteFile(signedFilePath);
      return res.redirect('redirect?type=failed');
    }

    deleteFile(signedFilePath);
    return res.redirect('redirect?type=failed');
  } catch (error) {
    console.log(error);
    deleteFile(signedFilePath);
    return res.redirect('redirect?type=failed');
  }
};
