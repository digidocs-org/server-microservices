import axios from 'axios';
import { BadRequestError } from '@digidocs/guardian';
import { endpoints } from 'authorization-service/types/endpoints';

const downloadDocumentService = async (documentId: string) => {
  try {
    const { DOCUMENT_ROUTES } = endpoints
    const response = await axios.post(DOCUMENT_ROUTES.downloadDocument, {
      documentId,
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw new BadRequestError('Cannot download document');
  }
};

export default downloadDocumentService;
