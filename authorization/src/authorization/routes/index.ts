import { Router } from 'express';
import {
  bodyValidators,
  currentUser,
  headerValidators,
  validateRequest,
} from '@digidocs/guardian';
import hasDocumentAccess from 'authorization-service/middlewares/has-document-access';
import createDocumentController from '../controllers/document/create-document-controller';
import downloadDocumentController from '../controllers/document/download-document-controller';
import indexDocumentController from 'authorization-service/controllers/document/index-document-controller';
import addRecipientsController from 'authorization-service/controllers/add-recipients-controller';
import sendDocumentController from 'authorization-service/controllers/document/send-document-controller';

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

    /**
     * @Route  GET '/api/v1/document/send'
     * @Desc   Send Document to the recipients
     * @Access Public
     */
    this.router.post(
      '/api/v1/document/:id/send',
      headerValidators('token'),
      validateRequest,
      currentUser,
      hasDocumentAccess,
      sendDocumentController
    );

    /**
     * @Route  GET '/api/v1/document/add-recipients'
     * @Desc   Add Recipients of the document
     * @Access Public
     */
    this.router.post(
      '/api/v1/document/:id/add-recipients',
      headerValidators('token'),
      validateRequest,
      currentUser,
      hasDocumentAccess,
      addRecipientsController
    );

    return this.router;
  }
}
