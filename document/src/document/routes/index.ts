import {
  headerValidators,
  bodyValidators,
  validateRequest,
  currentUser,
} from '@digidocs/guardian';
import { Router } from 'express';

import {
  createDocument,
  deleteDocument,
  downloadDocument,
  indexDocument,
  sendDocument,
} from 'document-service/controllers';
import { hasDocumentAccess } from 'document-service/middlewares/documentAccess';

export class DocumentRouter {
  private static router = Router();

  public static route() {
    /**
     * @Route  POST 'api/document/create'
     * @Desc   Create a document
     * @Access Public
     */
    this.router.post(
      '/api/document/create',
      bodyValidators('userId', 'file'),
      validateRequest,
      createDocument
    );

    /**
     * @Route  POST 'api/document/send'
     * @Desc   Update a document
     * @Access Public
     */
    this.router.post(
      '/api/document/:id/send',
      headerValidators('token'),
      validateRequest,
      currentUser,
      hasDocumentAccess,
      sendDocument
    );

    /**
     * @Route  GET 'api/document/download'
     * @Desc   download a document
     * @Access Public
     */
    this.router.post(
      '/api/document/download',
      bodyValidators('documentId'),
      validateRequest,
      downloadDocument
    );

    /**
     * @Route  GET 'api/document/index'
     * @Desc   index all the documents
     * @Access Public
     */
    this.router.post(
      '/api/document/index',
      headerValidators('token'),
      validateRequest,
      currentUser,
      hasDocumentAccess,
      indexDocument
    );

    /**
     * @Route  GET 'api/v1/document/:id'
     * @Desc   delete specific document
     * @Access Private
     */
    this.router.delete(
      '/api/document/:id',
      headerValidators('token'),
      currentUser,
      hasDocumentAccess,
      deleteDocument
    );

    return this.router;
  }
}
