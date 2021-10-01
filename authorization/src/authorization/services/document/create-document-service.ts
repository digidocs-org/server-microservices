import axios from 'axios';
import { UploadedFile } from 'express-fileupload';
import { BadRequestError } from '@digidocs/guardian';
import { DOCUMENT_ROUTES } from '../../routes/document';

const createDocumentService = async (
  userId: string,
  document: UploadedFile
) => {
  try {
    const response = await axios.post(DOCUMENT_ROUTES.createDocument, {
      file: document,
      userId: userId,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    throw new BadRequestError('Cannot upload the document');
  }
};

export default createDocumentService;
