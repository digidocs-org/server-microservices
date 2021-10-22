import { BadRequestError } from '@digidocs/guardian';
import { apiAdapter } from 'authorization-service/services/apiAdapter';
import { endpoints } from 'authorization-service/types/endpoints';
import { Request } from 'express';

export const updateDocumentService = async (req: Request) => {
  try {
    const api = apiAdapter(process.env.DOCUMENT_SERVICE_URL!);
    const { DOCUMENT_ROUTES } = endpoints;
    const response = await api.post(
      `${DOCUMENT_ROUTES.updateDocument}/${req.params.documentId}`,
      req.body,
      {
        headers: req.headers,
      }
    );
    return response.data;
  } catch (error) {
    throw new BadRequestError('Error while updating the document');
  }
};
