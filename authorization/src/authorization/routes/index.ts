import { Router } from 'express';
import {
  currentUser,
  headerValidators,
  validateRequest,
} from '@digidocs/guardian';
import hasDocumentAccess from 'authorization-service/middlewares/has-document-access';
import createDocumentController from '../controllers/document/create-document-controller';
import downloadDocumentController from '../controllers/document/download-document-controller';
import indexDocumentController from 'authorization-service/controllers/document/index-document-controller';

export class DocumentAuthorizationRouter {
  public static router = Router();

  public static route() {
    /**
     * @Route  GET '/api/v1/document'
     * @Desc   Create new document
     * @Access Public
     */
    this.router.post(
      '/api/v1/document',
      headerValidators('token'),
      validateRequest,
      currentUser,
      createDocumentController
    );

    /**
     * @Route  GET '/api/v1/document/:id/download'
     * @Desc   Download the document
     * @Access Public
     */
    this.router.get(
      '/api/v1/document/:id/download',
      headerValidators('token'),
      validateRequest,
      currentUser,
      hasDocumentAccess,
      downloadDocumentController
    );

    /**
     * @Route  GET '/api/v1/document/index'
     * @Desc   index all the documents
     * @Access Public
     */
    this.router.get(
      '/api/v1/document/:id/index',
      headerValidators('token'),
      validateRequest,
      currentUser,
      hasDocumentAccess,
      indexDocumentController
    );

    return this.router;
  }
}
