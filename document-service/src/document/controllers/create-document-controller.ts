import { Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import { createDocumentService } from 'document-service/document/services';
import { UploadedFile } from 'express-fileupload';
import {
  DocumentUserMap,
  Actions,
  User,
} from 'document-service/document/models';
import { ActionType } from '@digidocs/guardian';
import { CreateDocumentPublisher } from 'src/events/publishers/create-document-publisher';
import { natsWrapper } from 'document-service/nats-wrapper';

export const createDocumentController = async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    throw new NotAuthorizedError();
  }
  // Fetch the document from request
  const { files } = req;

  const user = await User.findById(userId);

  if (!user) {
    throw new BadRequestError('No user found!!');
  }

  if (!files) {
    throw new BadRequestError('Please upload a PDF file!');
  }

  if (files && Object.keys(files).length > 1) {
    throw new BadRequestError('Multilpe files upload is not allowed!');
  }

  const file = files.file as UploadedFile;

  try {
    const document = await createDocumentService(userId, file);
    new CreateDocumentPublisher(natsWrapper.client).publish({
      id: document.id,
      name: document.name,
      message: document.message,
      inOrder: document.inOrder,
      publicKeyId: document.publicKeyId,
      documentId: document.documentId,
      selfSign: document.selfSign,
      isDrafts: document.isDrafts,
      status: document.status,
      signType: document.signType,
      userId: document.userId,
      validTill: document.validTill,
      timeToSign: document.timeToSign,
      version: document.version,
    });

    const action = await Actions.create({
      type: ActionType.VIEW,
      recipientEmail: user.email,
    });

    await DocumentUserMap.create({
      user: user.id,
      document: document.id,
      action: action,
      access: true,
    });

    return res.send({ success: true, data: { id: document.id } });
  } catch (error: any) {
    throw new BadRequestError(error);
  }
};
