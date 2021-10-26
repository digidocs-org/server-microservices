import { UploadedFile } from 'express-fileupload';
import { BadRequestError } from '@digidocs/guardian';
import { endpoints } from 'authorization-service/types/endpoints';
import { apiAdapter } from 'authorization-service/services/apiAdapter';

const createDocumentService = async (
  userId: string,
  document: UploadedFile
) => {
  try {
    const api = apiAdapter(process.env.DOCUMENT_SERVICE_URL!);
    const { DOCUMENT_ROUTES } = endpoints;
    const response = await api.post(DOCUMENT_ROUTES.createDocument, {
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
