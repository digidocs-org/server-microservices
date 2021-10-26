import axios from 'axios';
import { BadRequestError } from '@digidocs/guardian';
import { endpoints } from 'authorization-service/types/endpoints';
import { apiAdapter } from 'authorization-service/services/apiAdapter'

const downloadDocumentService = async (documentId: string) => {
  try {
    const api = apiAdapter(process.env.DOCUMENT_SERVICE_URL!);
    const { DOCUMENT_ROUTES } = endpoints
    const response = await api.post(DOCUMENT_ROUTES.downloadDocument, {
      documentId,
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw new BadRequestError('Error while downloading document');
  }
};

export default downloadDocumentService;
