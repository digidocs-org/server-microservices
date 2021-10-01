import axios from 'axios';
import { BadRequestError } from '@digidocs/guardian';
import { DOCUMENT_ROUTES } from '../../routes/document';

const downloadDocumentService = async (documentId: string) => {
  try {
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
