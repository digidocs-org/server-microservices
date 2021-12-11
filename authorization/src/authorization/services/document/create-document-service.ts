import { UploadedFile } from 'express-fileupload';
import Document, { IDocument } from 'authorization-service/models/Document';
import {
  encryptDocument,
  IUploadOptions,
  uploadToS3Bucket,
  IUploadResponse,
  checkForPdf,
  checkForProtectedPdf,
  BadRequestError,
  parseUploadData,
} from '@digidocs/guardian';
import { DocumentStatus } from '@digidocs/guardian';

const createDocument = (userId: string, file: UploadedFile) => new Promise<IDocument>(async (resolve, reject) => {
  const fileData = Buffer.from(file.data);
  const fileName = file.name;

  if (!file || !checkForPdf(fileData)) {
    throw new BadRequestError('Please upload a PDF file!');
  }

  const isPasswordProtected = await checkForProtectedPdf(fileData);

  if (isPasswordProtected) {
    throw new BadRequestError('Cannot upload password protected file!');
  }

  // Encrypt the document.
  const { encryptedFile, publicKey } = encryptDocument(fileData);

  // Export public key.
  const exportPublicKey = publicKey.export({
    format: 'pem',
    type: 'spki',
  });

  const parsedFiles = parseUploadData(encryptedFile, exportPublicKey, userId!);

  // Upload document and key to s3.
  Promise.all<IUploadResponse>(
    parsedFiles.map((parsedFile: IUploadOptions) =>
      uploadToS3Bucket(parsedFile)
    )
  )
    .then(async data => {
      const documentID = data[0].name;
      const publicKeyID = data[1].name;

      // Add the document in Document schema
      const document = await Document.create({
        name: fileName,
        documentId: documentID,
        publicKeyId: publicKeyID,
        status: DocumentStatus.DRAFTS,
        isDrafts: true,
        userId: userId,
      });

      resolve(document);
    })
    .catch(err => {
      reject(err)
    });
})

export default createDocument