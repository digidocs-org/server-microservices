import { Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError } from '@digidocs/guardian';
import createDocumentService from 'src/authorization/services/document/create-document-service';
import { UploadedFile } from 'express-fileupload';
import DocumentUserMap from 'src/authorization/models/DocumentUserMap';
import Actions from 'authorization-service/models/Actions';
import { ActionType } from 'authorization-service/types';

export const createDocumentController = async (req: Request, res: Response) => {
  const user = req.currentUser;

  if (!user) {
    throw new NotAuthorizedError();
  }
  // Fetch the document from request
  const { files } = req.body;

  if (!files) {
    throw new BadRequestError('Please upload a PDF file!');
  }

  if (files && Object.keys(files).length > 1) {
    throw new BadRequestError('Multilpe files upload is not allowed!');
  }

  const file = files.file as UploadedFile;
  const data = await createDocumentService(user.id, file);

  const action = await Actions.create({
    type: ActionType.VIEW,
    recipientEmail: user.email,
  });

  await DocumentUserMap.create({
    user: user.id,
    document: data.data.id,
    action: action,
    access: true,
  });

  return res.send(data);
};
