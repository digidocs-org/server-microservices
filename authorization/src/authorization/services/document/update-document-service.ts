import { BadRequestError } from '@digidocs/guardian';
import { IDocumentActions } from 'authorization-service/models/Actions';
import Document, { IDocument } from 'authorization-service/models/Document';
import { ActionType } from 'authorization-service/types';
import { Request } from 'express';

const updateDocument = (req: Request) =>
  new Promise<IDocument>(async (resolve, reject) => {
    const { docUserMap } = req;
    const { documentId } = req.params;

    const action = docUserMap?.action as IDocumentActions;

    const document = await Document.findById(documentId);

    if (!document) {
      throw new BadRequestError("Document doesn't exist!!");
    }

    const newParams = req.body;

    if (newParams.selfSign) {
      action.type = ActionType.SIGN;
    } else if (
      newParams.selfSign !== undefined &&
      newParams.selfSign === false
    ) {
      action.type = ActionType.VIEW;
    }

    // Update the document params.
    document.set({
      name: newParams.name || document.name,
      message: newParams.message || document.message,
      inOrder:
        newParams.inOrder !== undefined ? newParams.inOrder : document.inOrder,
      hasClickedNext: true,
      selfSign:
        newParams.selfSign !== undefined
          ? newParams.selfSign
          : document.selfSign,
      sendForSign:
        newParams.sendForSign !== undefined
          ? newParams.sendForSign
          : document.sendForSign,
      validTill: newParams.validTill || document.validTill,
      timeToSign: newParams.timeToSign || document.timeToSign,
      signType:
        newParams.signType !== undefined
          ? newParams.signType
          : document.signType,
    });

    await document.save();
    await action.save();

    const documentResponse: any = document.toJSON();

    // Remove the document Id and publicKeyId from response.
    delete documentResponse.documentId;
    delete documentResponse.publicKeyId;

    resolve(documentResponse);
  });
export default updateDocument;
