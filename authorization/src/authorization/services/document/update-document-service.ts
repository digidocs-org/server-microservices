import { BadRequestError } from '@digidocs/guardian';
import Document, { IDocument } from 'authorization-service/models/Document';
import { Request } from 'express';

const updateDocument = (req: Request) => new Promise<IDocument>(async (resolve, reject) => {
  const { documentId } = req.params;

  const document = await Document.findById(documentId);

  if (!document) {
    throw new BadRequestError("Document doesn't exist!!");
  }

  const newParams = req.body;

  // Update the document params.
  document.set({
    name: newParams.name || document.name,
    message: newParams.message || document.message,
    inOrder:
      newParams.inOrder !== undefined ? newParams.inOrder : document.inOrder,
    selfSign:
      newParams.selfSign !== undefined ? newParams.selfSign : document.selfSign,
    validTill: newParams.validTill || document.validTill,
    timeToSign: newParams.timeToSign || document.timeToSign,
    signType:
      newParams.signType !== undefined ? newParams.signType : document.signType,
  });

  await document.save();
  // await documentUserMap.save();

  const documentResponse: any = document.toJSON();

  // Remove the document Id and publicKeyId from response.
  delete documentResponse.documentId;
  delete documentResponse.publicKeyId;

  resolve(documentResponse);
})
export default updateDocument;
