import {
  BadRequestError,
  decryptDocument,
  fetchData,
  NotFoundError,
} from '@digidocs/guardian';
import Document from 'authorization-service/models/Document'

const downloadDocument = (documentId: string) => new Promise<string>(async (resolve, reject) => {
  try {

    const document = await Document.findById(documentId);

    if (!document) {
      throw new NotFoundError();
    }

    const documentURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/documents/${document.documentId}`;
    const publicKeyURL = `${process.env.CLOUDFRONT_URI}/${document.userId}/keys/${document.publicKeyId}`;

    const encryptedFile = await fetchData(documentURL);
    const publicKeyBuffer = await fetchData(publicKeyURL);
    const publicKey = publicKeyBuffer.toString();

    const decryptedFile = decryptDocument(encryptedFile, publicKey) as Buffer;

    if (!decryptedFile) {
      throw new BadRequestError('cannot download document');
    }

    resolve(decryptedFile.toString("base64"))
  } catch (error) {
    reject(error)
  }
})


export default downloadDocument