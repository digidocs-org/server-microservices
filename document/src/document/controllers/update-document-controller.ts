import { BadRequestError } from '@digidocs/guardian';
import Document from 'document-service/models/document';
import { Request, Response } from 'express';
import { UpdateDocumentPublisher } from 'src/events/publishers/update-document-publisher';
import { natsWrapper } from 'src/nats-wrapper';

const updateDocument = async (req: Request, res: Response) => {
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
  new UpdateDocumentPublisher(natsWrapper.client).publish({
    id: documentId,
    name: document.name,
    message: document.message,
    inOrder: document.inOrder,
    selfSign: document.selfSign,
    validTill: document.validTill,
    timeToSign: document.timeToSign,
    signType: document.signType,
    version: document.__v,
  });
  // await documentUserMap.save();

  const documentResponse: any = document.toJSON();

  // Remove the document Id and publicKeyId from response.
  delete documentResponse.documentId;
  delete documentResponse.publicKeyId;

  return res.send({ success: true, document: documentResponse });
};

export default updateDocument;
